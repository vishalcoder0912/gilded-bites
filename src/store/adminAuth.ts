import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MOCK_ADMIN = {
  email: "admin@noirsane.com",
  password: "atelier1899",
  name: "Anaïs",
  initials: "AN",
};

interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      signIn: (email, password) => {
        if (
          email.trim().toLowerCase() === MOCK_ADMIN.email &&
          password === MOCK_ADMIN.password
        ) {
          set({ isAuthenticated: true, email: MOCK_ADMIN.email });
          return { ok: true };
        }
        return { ok: false, error: "Invalid credentials. Please try again." };
      },
      signOut: () => set({ isAuthenticated: false, email: null }),
    }),
    { name: "noir-sane-admin-auth" },
  ),
);
