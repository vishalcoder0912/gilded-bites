const PENDING_CART_KEY = "noir-sane-pending-cart";

export interface PendingCartItem {
  productId: string;
  quantity: number;
}

export const addPendingCartItem = (item: PendingCartItem) => {
  const items = getPendingCartItems();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(items));
};

export const getPendingCartItems = (): PendingCartItem[] => {
  const raw = sessionStorage.getItem(PENDING_CART_KEY);
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as PendingCartItem[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const getPendingCartCount = (): number => {
  return getPendingCartItems().reduce((sum, item) => sum + item.quantity, 0);
};

export const takePendingCartItems = (): PendingCartItem[] => {
  const items = getPendingCartItems();
  sessionStorage.removeItem(PENDING_CART_KEY);
  return items;
};
