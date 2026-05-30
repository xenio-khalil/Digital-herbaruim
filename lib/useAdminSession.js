"use client";

import { useAuth } from "@/components/AuthProvider";

/** @deprecated Use useAuth instead. Kept for gradual migration. */
export function useAdminSession() {
  const { isAdmin, signIn, signOut, loading } = useAuth();

  return {
    isAdmin,
    loading,
    loginWithPin: () => false,
    logout: signOut,
    signIn,
  };
}
