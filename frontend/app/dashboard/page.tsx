"use client";

import { useEffect, useState } from "react";
import { supabase, Property } from "../../lib/supabase";

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Statistiques
  const totalProperties = properties.length;
  const publishedProperties = properties.filter((p) => p.is_published);
  const draftProperties = properties.filter((p) => !p.is_published);

  const totalValue = properties.reduce((sum, p) => sum + Number(p.price), 0);
  const avgPrice = totalProperties > 0 ? totalValue / totalProperties : 0;
  const publishedValue = publishedProperties.reduce(
    (sum, p) => sum + Number(p.price),
    0,
  );
  const draftValue = draftProperties.reduce(
    (sum, p) => sum + Number(p.price),
    0,
  );

  // Statistiques par ville
  const citiesStats = properties.reduce(
    (acc, property) => {
      const city = property.city;
      if (!acc[city]) {
        acc[city] = {
          count: 0,
          published: 0,
          draft: 0,
          totalValue: 0,
        };
      }
      acc[city].count++;
      if (property.is_published) {
        acc[city].published++;
      } else {
        acc[city].draft++;
      }
      acc[city].totalValue += Number(property.price);
      return acc;
    },
    {} as Record<
      string,
      { count: number; published: number; draft: number; totalValue: number }
    >,
  );

  const citiesArray = Object.entries(citiesStats)
    .map(([city, stats]) => ({
      city,
      ...stats,
      avgPrice: stats.totalValue / stats.count,
    }))
    .sort((a, b) => b.count - a.count);

  // Propriétés les plus récentes
  const recentProperties = properties.slice(0, 5);

  // Propriétés les plus chères
  const expensiveProperties = [...properties]
    .sort((a, b) => Number(b.price) - Number(a.price))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-500">Vue d'ensemble</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => (window.location.href = "/my-properties")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-blue-600 hover:bg-blue-700 text-white font-medium
                         transition-all shadow-sm"
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Mes biens
              </button>

              <button
                onClick={() => (window.location.href = "/properties")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                         border border-gray-300 hover:border-gray-400
                         text-gray-700 hover:bg-gray-50 font-medium
                         transition-all"
              >
                Catalogue
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {totalProperties}
              </p>
              <p className="text-sm text-gray-600">biens enregistrés</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Valeur totale</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalValue.toLocaleString("fr-FR")} €
              </p>
            </div>
          </div>

          {/* Publiés */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Publiés
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {publishedProperties.length}
              </p>
              <p className="text-sm text-gray-600">
                {totalProperties > 0
                  ? Math.round(
                      (publishedProperties.length / totalProperties) * 100,
                    )
                  : 0}
                % du total
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Valeur publiée</p>
              <p className="text-lg font-semibold text-green-600">
                {publishedValue.toLocaleString("fr-FR")} €
              </p>
            </div>
          </div>

          {/* Brouillons */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Brouillons
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600 mb-1">
                {draftProperties.length}
              </p>
              <p className="text-sm text-gray-600">
                {totalProperties > 0
                  ? Math.round((draftProperties.length / totalProperties) * 100)
                  : 0}
                % du total
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Valeur en attente</p>
              <p className="text-lg font-semibold text-amber-600">
                {draftValue.toLocaleString("fr-FR")} €
              </p>
            </div>
          </div>

          {/* Prix moyen */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Prix moyen
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600 mb-1">
                {avgPrice.toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm text-gray-600">€ par bien</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Min</span>
                <span className="font-semibold text-gray-900">
                  {properties.length > 0
                    ? Math.min(
                        ...properties.map((p) => Number(p.price)),
                      ).toLocaleString("fr-FR")
                    : 0}{" "}
                  €
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Max</span>
                <span className="font-semibold text-gray-900">
                  {properties.length > 0
                    ? Math.max(
                        ...properties.map((p) => Number(p.price)),
                      ).toLocaleString("fr-FR")
                    : 0}{" "}
                  €
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Statistiques par ville */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Répartition par ville
              </h2>
            </div>
            <div className="p-6">
              {citiesArray.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune donnée disponible
                </p>
              ) : (
                <div className="space-y-4">
                  {citiesArray.map(
                    ({ city, count, published, draft, avgPrice }) => (
                      <div
                        key={city}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {city}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {count} bien{count > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {published}
                            </span>
                            <span className="flex items-center gap-1 text-amber-600">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {draft}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">
                            Prix moyen
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {avgPrice.toLocaleString("fr-FR", {
                              maximumFractionDigits: 0,
                            })}{" "}
                            €
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Biens les plus récents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Derniers biens ajoutés
              </h2>
            </div>
            <div className="p-6">
              {recentProperties.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun bien ajouté
                </p>
              ) : (
                <div className="space-y-3">
                  {recentProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                      onClick={() => (window.location.href = "/my-properties")}
                    >
                      <div
                        className={`w-2 h-12 rounded-full ${
                          property.is_published
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600">{property.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {Number(property.price).toLocaleString("fr-FR")} €
                        </p>
                        <span
                          className={`text-xs ${
                            property.is_published
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {property.is_published ? "Publié" : "Brouillon"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Biens les plus chers */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Top 5 - Biens les plus chers
            </h2>
          </div>
          <div className="p-6">
            {expensiveProperties.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun bien disponible
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {expensiveProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="relative p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => (window.location.href = "/my-properties")}
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {property.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-600">
                        {Number(property.price).toLocaleString("fr-FR", {
                          notation: "compact",
                          compactDisplay: "short",
                        })}
                        €
                      </p>
                      <span
                        className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                          property.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {property.is_published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
