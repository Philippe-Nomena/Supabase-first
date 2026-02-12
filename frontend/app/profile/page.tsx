"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    setUser(user);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
    setLoading(false);
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const roleColor =
    profile?.role === "agent"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.firstname} {profile.lastname}
              </h1>

              <p className="text-gray-500">{user?.email}</p>

              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${roleColor}`}
              >
                {profile?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium text-gray-900">
                  {profile.firstname} {profile.lastname}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium text-gray-900 capitalize">
                  {profile?.role}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Compte créé le</p>
                <p className="font-medium text-gray-900">
                  {new Date(profile?.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={() => (window.location.href = "/properties")}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-sm"
            >
              Retour
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                 border border-gray-300 hover:border-gray-400
                 text-gray-700 hover:bg-gray-50 font-medium
                 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
