import { create } from "zustand";
import { products } from "@/services/products";
import type { CartItem } from "./cart";

export type AdminOrderStatus = "pending" | "approved" | "rejected";

export interface AdminOrder {
  id: string;
  customerName: string;
  email: string;
  items: CartItem[];
  amount: number;
  utr: string;
  proofUrl: string; // mock screenshot/QR thumbnail
  status: AdminOrderStatus;
  createdAt: number;
}

const seed = (): AdminOrder[] => {
  const now = Date.now();
  const mk = (
    id: string,
    customerName: string,
    email: string,
    picks: Array<{ idx: number; qty: number }>,
    utr: string,
    status: AdminOrderStatus,
    minutesAgo: number,
  ): AdminOrder => {
    const items: CartItem[] = picks.map((p) => ({
      product: products[p.idx],
      quantity: p.qty,
    }));
    const amount = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    return {
      id,
      customerName,
      email,
      items,
      amount: amount + (amount > 2500 ? 0 : 150),
      utr,
      proofUrl: items[0].product.image,
      status,
      createdAt: now - minutesAgo * 60_000,
    };
  };

  return [
    mk("CN-LX01-PG7K", "Aanya Mehta", "aanya.m@example.com", [{ idx: 0, qty: 2 }, { idx: 3, qty: 1 }], "412980134567", "pending", 14),
    mk("CN-LX02-MR3J", "Rohan Iyer", "rohan.iyer@example.com", [{ idx: 1, qty: 1 }], "509812334412", "pending", 42),
    mk("CN-LX03-VN8B", "Priya Sharma", "priya.s@example.com", [{ idx: 4, qty: 3 }], "771204556899", "approved", 180),
    mk("CN-LX04-QD2L", "Karan Singh", "karan.singh@example.com", [{ idx: 2, qty: 2 }, { idx: 5, qty: 1 }], "338812007711", "pending", 320),
    mk("CN-LX05-FT9C", "Meera Nair", "meera.nair@example.com", [{ idx: 0, qty: 1 }], "440091238876", "rejected", 720),
    mk("CN-LX06-AZ4K", "Vikram Patel", "vikram.p@example.com", [{ idx: 3, qty: 2 }], "612348809901", "approved", 1450),
  ];
};

interface AdminOrdersState {
  orders: AdminOrder[];
  approve: (id: string) => void;
  reject: (id: string) => void;
  reset: () => void;
}

export const useAdminOrders = create<AdminOrdersState>((set) => ({
  orders: seed(),
  approve: (id) =>
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: "approved" } : o)) })),
  reject: (id) =>
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: "rejected" } : o)) })),
  reset: () => set({ orders: seed() }),
}));
