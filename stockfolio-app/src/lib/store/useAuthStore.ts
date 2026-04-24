'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface AuthStore {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  supabaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    
    set({ isLoading: true });
    const supabase = createClient();

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({
          supabaseUser: session.user,
          user: profile || userFromSession(session.user),
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        });
      } else {
        set({ isLoading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({
            supabaseUser: session.user,
            user: profile || userFromSession(session.user),
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            supabaseUser: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
    } catch {
      set({ isLoading: false, initialized: true });
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let message = error.message;
      // User-friendly error messages
      if (message === 'Invalid login credentials') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (message.includes('Email not confirmed')) {
        message = 'Please check your email and click the confirmation link before logging in.';
      }
      set({ isLoading: false, error: message });
      return { error: message };
    }

    // Auth succeeded — update state
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      set({
        supabaseUser: data.user,
        user: profile || userFromSession(data.user),
        isAuthenticated: true,
        isLoading: false,
      });
    }

    return {};
  },

  signupWithEmail: async (name, email, password) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, name },
      },
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    // Check if email confirmation is required
    // If user exists but session is null, confirmation is needed
    if (data.user && !data.session) {
      set({ isLoading: false });
      return { needsConfirmation: true };
    }

    // Auto-confirmed signup (email confirmation disabled)
    if (data.user && data.session) {
      const profile = await fetchProfile(data.user.id);
      set({
        supabaseUser: data.user,
        user: profile || userFromSession(data.user),
        isAuthenticated: true,
        isLoading: false,
      });
    }

    set({ isLoading: false });
    return {};
  },

  loginWithGoogle: async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, supabaseUser: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

// Build a profile from session data (fallback if profiles table isn't populated yet)
function userFromSession(user: SupabaseUser): UserProfile {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatar_url: user.user_metadata?.avatar_url,
  };
}

// Fetch profile from Supabase — returns null if not found (graceful)
async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  } catch {
    return null;
  }
}
