'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js';

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
  loginWithPhone: (phone: string) => Promise<{ error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Build a profile from session data (instant, no network call)
function userFromSession(user: SupabaseUser): UserProfile {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatar_url: user.user_metadata?.avatar_url,
  };
}

// Fetch profile from Supabase — fire-and-forget enrichment
// Returns null if not found (graceful)
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

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  supabaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    
    const supabase = createClient();

    try {
      // Use getUser() for server-verified session (not just local storage)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // FAST: Set auth state immediately with session data — no waiting for DB
        set({
          supabaseUser: user,
          user: userFromSession(user),
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        });

        // BACKGROUND: Enrich with profile data from DB (non-blocking)
        fetchProfile(user.id).then(profile => {
          if (profile) {
            set({ user: profile });
          }
        });
      } else {
        set({ isLoading: false, initialized: true });
      }

      // Listen for auth changes (Google OAuth return, sign out, etc.)
      supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Immediately set user from session metadata (instant)
          set({
            supabaseUser: session.user,
            user: userFromSession(session.user),
            isAuthenticated: true,
            isLoading: false,
          });

          // Background enrich
          fetchProfile(session.user.id).then(profile => {
            if (profile) {
              set({ user: profile });
            }
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            supabaseUser: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Silently update the supabase user reference
          set({ supabaseUser: session.user });
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

    // Auth succeeded — set state instantly from session
    if (data.user) {
      set({
        supabaseUser: data.user,
        user: userFromSession(data.user),
        isAuthenticated: true,
        isLoading: false,
      });

      // Background enrich
      fetchProfile(data.user.id).then(profile => {
        if (profile) set({ user: profile });
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
      set({
        supabaseUser: data.user,
        user: userFromSession(data.user),
        isAuthenticated: true,
        isLoading: false,
      });

      fetchProfile(data.user.id).then(profile => {
        if (profile) set({ user: profile });
      });
    }

    set({ isLoading: false });
    return {};
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      // Use NEXT_PUBLIC_SITE_URL for production, fallback to current origin for dev
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            prompt: 'select_account', // Always show account picker (avoids stale sessions)
          },
        },
      });
      if (error) {
        set({ isLoading: false, error: error.message });
      }
      // On success, the browser navigates away to Google, so isLoading stays true
    } catch (err) {
      set({ isLoading: false, error: 'Failed to initiate Google sign-in. Please try again.' });
      console.error('Google OAuth error:', err);
    }
  },

  loginWithPhone: async (phone: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }
    set({ isLoading: false });
    return {};
  },

  verifyOtp: async (phone: string, token: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }
    if (data.user) {
      set({
        supabaseUser: data.user,
        user: userFromSession(data.user),
        isAuthenticated: true,
        isLoading: false,
      });

      fetchProfile(data.user.id).then(profile => {
        if (profile) set({ user: profile });
      });
    }
    return {};
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, supabaseUser: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
