import { create } from "zustand";
import { ApiError, cartApi, Product } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface CartItemState {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product: Product;
}

interface CartState {
  items: CartItemState[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  getSubtotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      set({ items: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart();
      set({ items: cart.items as CartItemState[], isLoading: false });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        set({ items: [], isLoading: false, error: null });
        return;
      }

      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to fetch cart" });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const item = await cartApi.addItem(productId, quantity);
      set((state) => {
        const existing = state.items.find((i) => i.productId === productId);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.productId === productId ? (item as CartItemState) : i
            ),
            isOpen: true,
            isLoading: false,
          };
        }
        return { items: [...state.items, item as CartItemState], isOpen: true, isLoading: false };
      });
      toast({ title: "Added to cart" });
    } catch (err: unknown) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to add to cart" });
      toast({ title: "Failed to add to cart", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(itemId);
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const item = await cartApi.updateItem(itemId, quantity);
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to update quantity" });
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.removeItem(itemId);
      set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to remove item" });
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clearCart();
      set({ items: [] });
    } catch (err: unknown) {
      console.error("Failed to clear cart:", err);
    }
  },

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  getSubtotal: () => get().items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0),
  getCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
