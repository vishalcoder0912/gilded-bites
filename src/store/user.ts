import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

export interface CustomerUser {
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

interface UserState {
  isAuthenticated: boolean;
  user: CustomerUser | null;
  isGoogleUser: boolean;
  signUp: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signInWithGoogle: () => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  init: () => void;
}

const validateCredentials = (email: string, password: string) => {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isGoogleUser: false,

      init: () => {
        if (!isFirebaseConfigured || !auth) return;
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            set({
              isAuthenticated: true,
              user: {
                email: firebaseUser.email ?? "",
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              },
              isGoogleUser: true,
            });
          }
        });
      },

      signUp: async (email, password) => {
        const error = validateCredentials(email, password);
        if (error) return { ok: false, error };
        await new Promise((resolve) => setTimeout(resolve, 450));
        set({ isAuthenticated: true, user: { email: email.trim().toLowerCase(), displayName: null, photoURL: null }, isGoogleUser: false });
        return { ok: true };
      },
      signIn: async (email, password) => {
        const error = validateCredentials(email, password);
        if (error) return { ok: false, error };
        await new Promise((resolve) => setTimeout(resolve, 450));
        set({ isAuthenticated: true, user: { email: email.trim().toLowerCase(), displayName: null, photoURL: null }, isGoogleUser: false });
        return { ok: true };
      },
      signInWithGoogle: async () => {
        if (!isFirebaseConfigured || !auth || !googleProvider) {
          return { ok: false, error: "Firebase is not configured. Please add your Firebase credentials to the .env file." };
        }
        try {
          const result = await signInWithPopup(auth, googleProvider);
          set({
            isAuthenticated: true,
            user: {
              email: result.user.email ?? "",
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            },
            isGoogleUser: true,
          });
          return { ok: true };
        } catch (err: unknown) {
          const code = (err as { code?: string }).code;
          if (code === "auth/popup-closed-by-user") return { ok: false, error: "" };
          return { ok: false, error: "Google sign-in failed. Please try again." };
        }
      },
      signOut: async () => {
        try { await firebaseSignOut(auth); } catch { /* ignore */ }
        set({ isAuthenticated: false, user: null, isGoogleUser: false });
      },
    }),
    { name: "noir-sane-user" },
  ),
);
