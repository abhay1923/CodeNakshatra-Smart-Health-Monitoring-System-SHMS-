import {
  createClient,
  type AuthChangeEvent,
  type Session,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js';
import type { Role } from './demo-data';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
  ;

export async function probeSupabase() {
  if (!supabase) {
    return { configured: false, reachable: false, message: 'Env keys missing' };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { configured: true, reachable: false, message: error.message };
    }

    return { configured: true, reachable: true, message: 'Connection ready' };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      message: error instanceof Error ? error.message : 'Unknown Supabase error',
    };
  }
}

export function getUserRole(user: User | null): Role {
  const fromUser = user?.user_metadata?.role ?? user?.app_metadata?.role;
  return fromUser === 'doctor' || fromUser === 'admin' ? fromUser : 'citizen';
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        role: input.role,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession() {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token ?? null;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => undefined } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}
