import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";

interface DeliveryAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useDeliveryAuth = create<DeliveryAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          if (response.user.role !== "DELIVERY_PARTNER") {
            set({ isLoading: false, error: "Access denied. Delivery partner role required." });
            return { ok: false, error: "Access denied. Delivery partner role required." };
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
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        try {
          const user = await authApi.me();
          if (user.role !== "DELIVERY_PARTNER") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            set({ user: null, isAuthenticated: false });
            return;
          }
          localStorage.setItem("user", JSON.stringify(user));
          set({ user, isAuthenticated: true });
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "noir-sane-delivery-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);