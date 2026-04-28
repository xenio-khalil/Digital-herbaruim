"use client";

const ADMIN_SESSION_KEY = "kas-admin-active";
const ADMIN_SESSION_EVENT = "admin-session-changed";

export function isAdminSessionActive() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminSessionActive(active) {
  if (typeof window === "undefined") return;

  if (active) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
  } else {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

export function verifyAdminPin(enteredPin) {
  const configuredPin = process.env.NEXT_PUBLIC_ADMIN_PIN;
  if (!configuredPin || typeof enteredPin !== "string") return false;
  return enteredPin.trim() === configuredPin.trim();
}

export { ADMIN_SESSION_EVENT };
