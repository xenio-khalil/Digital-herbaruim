"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  isAdminRole,
  isProfessorRole,
  isReviewerRole,
  isStudentRole,
  signInWithGoogle,
  signOutUser,
} from "@/lib/auth";

/** @typedef {{ id: string, displayName?: string, email?: string, photoURL?: string, role?: string }} UserProfile */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      profileUnsub = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        },
      );
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const signIn = useCallback(async () => {
    setAuthError("");
    try {
      const { profile: created } = await signInWithGoogle();
      setProfile(created);
      return true;
    } catch (e) {
      console.error(e);
      setAuthError(e?.message || "Could not sign in with Google.");
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setProfile(null);
    setFirebaseUser(null);
  }, []);

  const role = profile?.role ?? "";

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      role,
      loading,
      authError,
      isSignedIn: Boolean(firebaseUser),
      isAdmin: isAdminRole(role),
      isProfessor: isProfessorRole(role),
      isReviewer: isReviewerRole(role),
      isStudent: isStudentRole(role) || (!role && Boolean(firebaseUser)),
      signIn,
      signOut,
    }),
    [firebaseUser, profile, role, loading, authError, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
