import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types TypeScript
export type Profile = {
  id: string;
  role: "agent" | "client" | "utilisateur";
  firstname: string;
  lastname: string;
  created_at?: string;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  agent_id: string;
  is_published: boolean;
  created_at?: string;
};
