import { create } from "zustand";
import type { CartItem } from "./cart";

export interface Order {
  id: string;
  items: CartItem[];
  amount: number;
  utr: string;
  screenshotName?: string;
  createdAt: number;
}

interface OrderState {
  current?: Order;
  setCurrent: (o: Order) => void;
  clear: () => void;
}

export const useOrder = create<OrderState>((set) => ({
  current: undefined,
  setCurrent: (o) => set({ current: o }),
  clear: () => set({ current: undefined }),
}));

export const generateOrderId = () =>
  "CN-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
