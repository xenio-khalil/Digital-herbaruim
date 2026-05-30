import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/** @typedef {'student' | 'admin' | 'professor'} UserRole */

export const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  PROFESSOR: "professor",
};

/** Bootstrap admin emails — used only on first-time user document creation. */
export const ADMIN_EMAILS = ["lamizikhalil@gmail.com"];

const googleProvider = new GoogleAuthProvider();

function resolveBootstrapRole(email) {
  const normalized = (email ?? "").trim().toLowerCase();
  if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) {
    return ROLES.ADMIN;
  }
  return ROLES.STUDENT;
}

/**
 * @param {import("firebase/auth").User} firebaseUser
 */
export async function ensureUserProfile(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  const profile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
    photoURL: firebaseUser.photoURL ?? "",
    role: resolveBootstrapRole(firebaseUser.email),
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, profile);
  return { id: firebaseUser.uid, ...profile };
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const profile = await ensureUserProfile(result.user);
  return { user: result.user, profile };
}

export async function signOutUser() {
  await firebaseSignOut(auth);
}

export function isAdminRole(role) {
  return role === ROLES.ADMIN;
}

export function isProfessorRole(role) {
  return role === ROLES.PROFESSOR;
}

export function isReviewerRole(role) {
  return isAdminRole(role) || isProfessorRole(role);
}

export function isStudentRole(role) {
  return role === ROLES.STUDENT;
}
