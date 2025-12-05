"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// App user type (from your database)
export interface AppUser {
  id: number;
  email: string;
  full_name: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL for backend calls
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch app user from backend using Supabase token
  const fetchAppUser = async (accessToken: string): Promise<AppUser | null> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  // Sync user with backend (create if not exists)
  const syncUserWithBackend = async (
    accessToken: string,
    email: string,
    fullName: string
  ): Promise<AppUser | null> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email, full_name: fullName }),
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.access_token) {
        fetchAppUser(session.access_token).then((appUser) => {
          setUser(appUser);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.access_token) {
          const appUser = await fetchAppUser(session.access_token);
          setUser(appUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Sync user with backend after successful signup
    if (data.session?.access_token) {
      const appUser = await syncUserWithBackend(
        data.session.access_token,
        email,
        fullName
      );
      setUser(appUser);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Fetch app user after successful login
    if (data.session?.access_token) {
      const appUser = await fetchAppUser(data.session.access_token);
      setUser(appUser);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    if (session?.access_token) {
      const appUser = await fetchAppUser(session.access_token);
      setUser(appUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoading,
        isAuthenticated: !!user && !!session,
        isAdmin: user?.role === "admin",
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
