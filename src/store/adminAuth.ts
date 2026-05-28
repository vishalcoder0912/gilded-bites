import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";

interface AdminAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          if (response.user.role !== "ADMIN") {
            set({ isLoading: false, error: "Access denied. Admin role required." });
            return { ok: false, error: "Access denied. Admin role required." };
          }
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return { ok: true };
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : "Login failed";
          set({ isLoading: false, error });
          return { ok: false, error };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch { /* ignore */ }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        set({ user: null, isAuthenticated: false, error: null });
      },

      loadUser: async () => {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        // Optimistically use stored user for instant UI
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser) as User;
            if (user.role === "ADMIN") {
              set({ user, isAuthenticated: true, isLoading: false });
            }
          } catch {
            localStorage.removeItem("user");
          }
        }

        // Always verify with backend
        try {
          const user = await authApi.me();
          if (user.role === "ADMIN") {
            localStorage.setItem("user", JSON.stringify(user));
            set({ user, isAuthenticated: true });
          } else {
            // Logged in but not admin
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // Any error (401, 403, network) → clear stale auth state
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "noir-sane-admin-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
