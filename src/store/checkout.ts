import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PaymentMethod = "upi" | "card";

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
}

interface CheckoutState {
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  setAddress: (address: ShippingAddress) => void;
  updateAddress: (field: keyof ShippingAddress, value: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  isAddressComplete: () => boolean;
  reset: () => void;
}

export const emptyAddress: ShippingAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
};

export const isShippingAddressComplete = (address: ShippingAddress) =>
  Boolean(
    address.name.trim() &&
      address.phone.trim() &&
      address.line1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      /^\d{6}$/.test(address.postalCode.trim()),
  );

export const useCheckout = create<CheckoutState>()(
  persist(
    (set, get) => ({
      address: emptyAddress,
      paymentMethod: "upi",
      setAddress: (address) => set({ address }),
      updateAddress: (field, value) =>
        set((state) => ({ address: { ...state.address, [field]: value } })),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      isAddressComplete: () => isShippingAddressComplete(get().address),
      reset: () => set({ address: emptyAddress, paymentMethod: "upi" }),
    }),
    { name: "noir-sane-checkout" },
  ),
);
