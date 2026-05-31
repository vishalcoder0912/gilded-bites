import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
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

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return { ok: true };
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : "Registration failed";
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
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authApi.me();
          localStorage.setItem("user", JSON.stringify(user));
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token invalid or user deleted from DB: force a clean logout.
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },


      clearError: () => set({ error: null }),
    }),
    {
      name: "noir-sane-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

if (typeof window !== "undefined") {
  window.addEventListener("noir-sane-session-expired", () => {
    useAuth.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });
}

export const isAdmin = () => useAuth.getState().user?.role === "ADMIN";
export const isDeliveryPartner = () => useAuth.getState().user?.role === "DELIVERY_PARTNER";
export const isUser = () => useAuth.getState().user?.role === "USER";
export const getUserRole = () => useAuth.getState().user?.role;
