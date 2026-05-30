"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { ROLES } from "@/lib/auth";

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (!cancelled) setUsers(rows);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAdmin, router]);

  async function changeRole(userId, role) {
    setBusyId(userId);
    setError("");
    try {
      await updateDoc(doc(db, "users", userId), { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (e) {
      console.error(e);
      setError("Could not update user role.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Administration
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">User management</h1>
          <p className="mt-2 text-emerald-800/90">
            Assign professor or admin roles after faculty sign in with Google.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-emerald-800 hover:underline">
            ← Back to collection
          </Link>
        </header>

        {loading && <p className="text-emerald-800">Loading users…</p>}
        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-800">{error}</p>}

        {!loading && (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-emerald-950">{user.displayName || "Unnamed user"}</p>
                  <p className="text-sm text-emerald-700">{user.email || "—"}</p>
                  <p className="mt-1 text-xs capitalize text-emerald-600">Current: {user.role || "student"}</p>
                </div>
                <label className="flex items-center gap-2">
                  <span className="sr-only">Change role for {user.displayName}</span>
                  <select
                    value={user.role || ROLES.STUDENT}
                    disabled={busyId === user.id}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-600/25"
                  >
                    <option value={ROLES.STUDENT}>Student</option>
                    <option value={ROLES.PROFESSOR}>Professor</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
