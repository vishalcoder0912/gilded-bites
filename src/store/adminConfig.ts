import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminConfigState {
  upiId: string;
  draftUpiId: string;
  setUpiId: (upiId: string) => void;
  saveUpiId: () => Promise<void>;
}

export const useAdminConfig = create<AdminConfigState>()(
  persist(
    (set, get) => ({
      upiId: "cocoanoir@upi",
      draftUpiId: "cocoanoir@upi",
      setUpiId: (draftUpiId) => set({ draftUpiId }),
      saveUpiId: async () => {
        await new Promise((resolve) => setTimeout(resolve, 350));
        set({ upiId: get().draftUpiId.trim() || "cocoanoir@upi" });
      },
    }),
    {
      name: "noir-sane-admin-config",
      partialize: (state) => ({ upiId: state.upiId, draftUpiId: state.draftUpiId }),
    },
  ),
);
