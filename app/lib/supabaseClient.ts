import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const errorResult = { data: null, error: { message: 'Supabase not configured' } };

const safeQuery = {
  select: async () => errorResult,
  insert: async () => errorResult,
  update: async () => errorResult,
  delete: async () => errorResult,
  upsert: async () => errorResult,
  maybeSingle: async () => errorResult,
  order: async () => errorResult,
  eq: async () => errorResult,
  gte: async () => errorResult,
  not: async () => errorResult,
};

const safeAuth = {
  signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
  signOut: async () => ({ error: { message: 'Supabase not configured' } }),
  getSession: async () => ({ data: { session: null }, error: { message: 'Supabase not configured' } }),
};

export const safeSupabase = new Proxy(supabase, {
  get(target, prop) {
    if (prop === 'from') {
      return (table: string) => {
        if (isSupabaseConfigured) return target.from(table);
        return safeQuery as any;
      };
    }

    if (prop === 'auth') {
      if (isSupabaseConfigured) return (target as any).auth;
      return safeAuth as any;
    }

    return Reflect.get(target, prop as keyof typeof supabase);
  },
});
