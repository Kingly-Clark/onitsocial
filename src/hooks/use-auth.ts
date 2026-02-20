"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User as DatabaseUser } from "@/types/database";

interface AuthState {
  user: DatabaseUser | null;
  session: SupabaseUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const supabase = createClient();
  const { user: storeUser, setUser, setLoading } = useUserStore();
  const [session, setSession] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setSession(user);

        if (user) {
          // Fetch full user profile from database
          const { data: userProfile, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!error && userProfile) {
            setUser(userProfile as DatabaseUser);
          } else {
            // Create user profile if it doesn't exist
            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || null,
                  avatar_url: user.user_metadata?.avatar_url || null,
                  subscription_plan: "solo",
                  subscription_status: "trialing",
                  brand_limit: 1,
                  timezone: "UTC",
                },
              ])
              .select()
              .single();

            if (!createError && newUser) {
              setUser(newUser as DatabaseUser);
            } else {
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession?.user || null);

      if (newSession?.user) {
        try {
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", newSession.user.id)
            .single();

          if (userProfile) {
            setUser(userProfile as DatabaseUser);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setLoading]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
      throw err;
    }
  };

  return {
    user: storeUser,
    session,
    isLoading,
    signOut,
  };
}
