"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_SESSION_EVENT,
  isAdminSessionActive,
  verifyAdminPin,
  setAdminSessionActive,
} from "@/lib/adminSession";

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(() => isAdminSessionActive());

  const syncAdminState = useCallback(() => {
    setIsAdmin(isAdminSessionActive());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncAdminState);
    window.addEventListener(ADMIN_SESSION_EVENT, syncAdminState);
    return () => {
      window.removeEventListener("storage", syncAdminState);
      window.removeEventListener(ADMIN_SESSION_EVENT, syncAdminState);
    };
  }, [syncAdminState]);

  const loginWithPin = useCallback((pin) => {
    const ok = verifyAdminPin(pin);
    if (!ok) return false;
    setAdminSessionActive(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setAdminSessionActive(false);
  }, []);

  return { isAdmin, loginWithPin, logout };
}
