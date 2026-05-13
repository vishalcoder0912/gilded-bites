const PENDING_CART_ITEM_KEY = "noir-sane-pending-cart-item";

export interface PendingCartItem {
  productId: string;
  quantity: number;
}

export const savePendingCartItem = (item: PendingCartItem) => {
  sessionStorage.setItem(PENDING_CART_ITEM_KEY, JSON.stringify(item));
};

export const takePendingCartItem = (): PendingCartItem | null => {
  const raw = sessionStorage.getItem(PENDING_CART_ITEM_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(PENDING_CART_ITEM_KEY);

  try {
    const item = JSON.parse(raw) as Partial<PendingCartItem>;
    if (!item.productId || !Number.isFinite(item.quantity) || item.quantity < 1) return null;
    return { productId: item.productId, quantity: Math.floor(item.quantity) };
  } catch {
    return null;
  }
};
