const RAW_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const BASE_URL = RAW_BASE_URL.endsWith("/api") ? RAW_BASE_URL : `${RAW_BASE_URL}/api`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

const clearAuthSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("noir-sane-session-expired"));
  }
};

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

type RequestOptions = RequestInit & {
  skipJsonHeader?: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { skipJsonHeader, ...fetchOptions } = options;
  const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;

  if (!skipJsonHeader && hasBody && !(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && retry && path !== "/auth/login" && path !== "/auth/register") {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshJson = await refreshResponse.json();
          const tokens = refreshJson.data ?? refreshJson;

          localStorage.setItem("accessToken", tokens.accessToken);
          localStorage.setItem("refreshToken", tokens.refreshToken);

          return request<T>(path, options, false);
        }
      } catch {
        // Fall through to logout.
      }
    }

    clearAuthSession();

    throw new ApiError(401, "Session expired");
  }

  // 403 with a stale token (e.g. after DB reset, user no longer exists) → treat as session expired
  if (
    response.status === 403 &&
    path !== "/auth/login" &&
    path !== "/auth/register" &&
    path !== "/auth/me"
  ) {
    const json403 = await parseResponse(response);
    const message = json403?.message || "Forbidden";
    // If the error says "User is inactive" the token is for a deleted user — clear auth
    if (message === "User is inactive" || message === "Insufficient permissions") {
      // Only clear on "User is inactive" (deleted user), not on role-based access denial
      if (message === "User is inactive") {
        clearAuthSession();
      }
    }
    throw new ApiError(403, message, json403);
  }


  const json = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.message || `Request failed with status ${response.status}`,
      json,
    );
  }

  if (json?.pagination && Array.isArray(json.data)) {
    return { data: json.data, ...json.pagination } as T;
  }

  return (json?.data ?? json) as T;
}

export const api = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },

  upload<T>(path: string, fileOrFormData: File | FormData) {
    const formData =
      fileOrFormData instanceof FormData
        ? fileOrFormData
        : (() => {
            const data = new FormData();
            data.append("file", fileOrFormData);
            return data;
          })();

    return request<T>(path, {
      method: "POST",
      body: formData,
      skipJsonHeader: true,
    });
  },
};

export const authApi = {
  async login(email: string, password: string) {
    return api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", { email, password });
  },

  async register(data: RegisterData) {
    return api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/register", data);
  },

  async me() {
    return api.get<User>("/auth/me");
  },

  async refresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new ApiError(401, "No refresh token");
    return api.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", { refreshToken });
  },

  async logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // Ignore logout errors.
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

export const catalogApi = {
  async getProducts(params?: ProductQueryParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.q) query.set("q", params.q);
    if (params?.sort) query.set("sort", params.sort);
    const queryString = query.toString();
    return api.get<PaginatedResponse<Product>>(`/products${queryString ? `?${queryString}` : ""}`);
  },

  async getProductBySlug(slug: string) {
    return api.get<Product>(`/products/${slug}`);
  },

  async getCategories() {
    return api.get<Category[]>("/categories");
  },

  async getActiveUpi() {
    return api.get<UpiSetting[]>("/payment/upi/active");
  },
};

export const cartApi = {
  async getCart() {
    return api.get<Cart>("/cart");
  },

  async addItem(productId: string, quantity: number) {
    return api.post<CartItem>("/cart/items", { productId, quantity });
  },

  async updateItem(itemId: string, quantity: number) {
    return api.patch<CartItem>(`/cart/items/${itemId}`, { quantity });
  },

  async removeItem(itemId: string) {
    return api.delete(`/cart/items/${itemId}`);
  },

  async clearCart() {
    return api.delete("/cart/clear");
  },
};

export const addressApi = {
  async getAddresses() {
    return api.get<Address[]>("/addresses");
  },

  async createAddress(data: AddressData) {
    return api.post<Address>("/addresses", data);
  },

  async updateAddress(id: string, data: Partial<AddressData>) {
    return api.patch<Address>(`/addresses/${id}`, data);
  },

  async deleteAddress(id: string) {
    return api.delete(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string) {
    return api.patch(`/addresses/${id}/default`);
  },
};

export const orderApi = {
  async createOrder(data: OrderData) {
    return api.post<Order>("/orders", data);
  },

  async getOrders() {
    return api.get<Order[]>("/orders");
  },

  async getOrder(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },

  async submitPayment(orderId: string, paymentReferenceNumber: string, upiId?: string) {
    return api.post<Order>(`/orders/${orderId}/payment-submit`, { paymentReferenceNumber, upiId });
  },

  async createStripeCheckout(orderId: string) {
    return api.post<{ url: string }>(`/orders/${orderId}/stripe-checkout`);
  },

  async createUpiSession(orderId: string) {
    return api.post<UpiSession>(`/orders/${orderId}/upi-session`);
  },

  async submitUpiSession(
    sessionId: string,
    data: { utr: string; proofImageUrl: string }
  ) {
    return api.post<Order>(`/upi-sessions/${sessionId}/submit`, data);
  },

  async cancelOrder(orderId: string) {
    return api.post(`/orders/${orderId}/cancel`);
  },

  async getTracking(orderId: string) {
    return api.get<TrackingResponse>(`/orders/${orderId}/tracking`);
  },
};

export const couponApi = {
  async validate(couponCode: string) {
    return api.post<CouponValidation>("/coupons/validate", { couponCode });
  },
};

export const adminApi = {
  async getDashboard() {
    return api.get<DashboardData>("/admin/dashboard");
  },

  async getOrders(params?: ProductQueryParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const queryString = query.toString();
    return api.get<PaginatedResponse<Order>>(`/admin/orders${queryString ? `?${queryString}` : ""}`);
  },

  async getOrder(id: string) {
    return api.get<Order>(`/admin/orders/${id}`);
  },

  async updateOrderStatus(id: string, status: string, title?: string, message?: string, locationText?: string) {
    return api.patch<Order>(`/admin/orders/${id}/status`, { status, title, message, locationText });
  },

  async updatePaymentStatus(id: string, paymentStatus: string) {
    return api.patch<Order>(`/admin/orders/${id}/payment-status`, { paymentStatus });
  },

  async assignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
    return api.patch<Order>(`/admin/orders/${orderId}/assign-delivery-partner`, { deliveryPartnerId });
  },

  async setEstimatedDeliveryTime(orderId: string, adminEstimatedDeliveryTime?: string, estimatedDeliveryMessage?: string) {
    return api.patch<Order>(`/admin/orders/${orderId}/estimated-delivery-time`, { adminEstimatedDeliveryTime, estimatedDeliveryMessage });
  },

  async getProducts(params?: ProductQueryParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.q) query.set("q", params.q);
    const queryString = query.toString();
    return api.get<PaginatedResponse<Product>>(`/admin/products${queryString ? `?${queryString}` : ""}`);
  },

  async createProduct(data: ProductData) {
    return api.post<Product>("/admin/products", data);
  },

  async updateProduct(id: string, data: Partial<ProductData>) {
    return api.patch<Product>(`/admin/products/${id}`, data);
  },

  async deleteProduct(id: string) {
    return api.delete(`/admin/products/${id}`);
  },

  async getCategories() {
    return api.get<Category[]>("/admin/categories");
  },

  async createCategory(data: CategoryData) {
    return api.post<Category>("/admin/categories", data);
  },

  async updateCategory(id: string, data: Partial<CategoryData>) {
    return api.patch<Category>(`/admin/categories/${id}`, data);
  },

  async deleteCategory(id: string) {
    return api.delete(`/admin/categories/${id}`);
  },

  async getStock() {
    return api.get<Stock[]>("/admin/stock");
  },

  async updateStock(productId: string, data: { quantity?: number; lowStockThreshold?: number }) {
    return api.patch<Stock>(`/admin/stock/${productId}`, data);
  },

  async adjustStock(productId: string, quantity: number, reason?: string) {
    return api.post<Stock>(`/admin/stock/${productId}/adjust`, { quantity, reason });
  },

  async getUpiSettings() {
    return api.get<UpiSetting[]>("/admin/upi");
  },

  async createUpiSetting(data: UpiSettingData) {
    return api.post<UpiSetting>("/admin/upi", data);
  },

  async updateUpiSetting(id: string, data: Partial<UpiSettingData>) {
    return api.patch<UpiSetting>(`/admin/upi/${id}`, data);
  },

  async deleteUpiSetting(id: string) {
    return api.delete(`/admin/upi/${id}`);
  },

  async getDeliveryPartners() {
    return api.get<User[]>("/admin/users/delivery-partners");
  },

  async addTracking(orderId: string, data: { status: string; title: string; message: string; locationText?: string }) {
    return api.post(`/admin/orders/${orderId}/tracking`, data);
  },
};

export const deliveryApi = {
  async getOrders() {
    return api.get<Order[]>("/delivery/orders");
  },

  async getOrder(id: string) {
    return api.get<Order>(`/delivery/orders/${id}`);
  },

  async updateStatus(id: string, status: string, title?: string, message?: string, locationText?: string) {
    return api.patch<Order>(`/delivery/orders/${id}/status`, { status, title, message, locationText });
  },

  async updateLocation(id: string, title: string, message: string, locationText?: string) {
    return api.post(`/delivery/orders/${id}/location`, { title, message, locationText });
  },
};

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  mrp: number | null;
  discountPercent: number;
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category?: Category;
  stock?: Stock;
  createdAt: string;
}

const localImageBySlug = (product: Product): string => {
  const slug = `${product.slug || ""} ${product.category?.slug || ""} ${product.category?.name || ""}`.toLowerCase();

  if (slug.includes("apple")) return "/products/apple-box.png";
  if (slug.includes("orange")) return "/products/orange-box.png";
  if (slug.includes("mango")) return "/products/mango-box.png";
  if (slug.includes("grape")) return "/products/grape-box.png";
  if (slug.includes("pineapple")) return "/products/pineapple-box.png";
  if (slug.includes("pomegranate") || slug.includes("ruby")) return "/products/pomegranate-box.png";
  if (slug.includes("fusion") || slug.includes("praline") || slug.includes("coffret") || slug.includes("maison")) return "/products/fusion-box.png";
  if (slug.includes("bar") || slug.includes("hazelnut") || slug.includes("caramel")) return "/products/orange-box.png";
  if (slug.includes("truffle")) return "/products/pomegranate-box.png";
  if (slug.includes("bonbon")) return "/products/apple-box.png";
  if (slug.includes("single") || slug.includes("origin") || slug.includes("ecuador") || slug.includes("ivory")) return "/products/mango-box.png";

  return "/products/fusion-box.png";
};

export const getProductImageCandidates = (product: Product): string[] => {
  const localFallback = localImageBySlug(product);
  const stableUrls = (product.imageUrls || []).filter((url) => {
    if (!url) return false;
    return !url.includes("images.unsplash.com");
  });

  return Array.from(new Set([...stableUrls, localFallback, "/placeholder.svg"]));
};

export const getProductImage = (product: Product): string => {
  return getProductImageCandidates(product)[0];
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

export interface Stock {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product: Product;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface AddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  transactionId: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  upiId: string | null;
  paymentReferenceNumber: string | null;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  couponId: string | null;
  couponCodeSnapshot: string | null;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddressLine1: string;
  deliveryAddressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  deliveryPartnerId: string | null;
  adminEstimatedDeliveryTime: string | null;
  estimatedDeliveryMessage: string | null;
  createdAt: string;
  items: OrderItem[];
  deliveryPartner?: User;
  tracking?: DeliveryTracking[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  productPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
  product?: Product;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  status: string;
  title: string;
  message: string;
  locationText: string | null;
  createdAt: string;
}

export interface OrderData {
  paymentMethod: "UPI" | "COD" | "STRIPE";
  addressId?: string;
  address?: AddressData;
  couponCode?: string;
}

export interface CouponValidation {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
}

export interface TrackingResponse {
  orderNumber: string;
  currentStatus: string;
  currentLocationText: string | null;
  estimatedDeliveryTime: string | null;
  estimatedDeliveryMessage: string | null;
  deliveryPartnerName: string | null;
  deliveryPartnerPhone: string | null;
  trackingTimeline: DeliveryTracking[];
}

export interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  lowStockProducts: Stock[];
  recentOrders: Order[];
}

export interface UpiSetting {
  id: string;
  upiId: string;
  displayName: string | null;
  qrCodeUrl: string | null;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface UpiSession {
  id: string;
  orderId: string;
  upiSettingId: string;
  upiIdSnapshot: string;
  payeeName: string;
  amount: number;
  currency: string;
  transactionRef: string;
  upiUri: string;
  qrDataUrl: string;
  status: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
  utr?: string;
  proofImageUrl?: string;
  expiresAt: string;
  secondsLeft?: number;
}


export interface UpiSettingData {
  upiId: string;
  displayName?: string;
  qrCodeUrl?: string;
  isActive?: boolean;
}

export interface ProductData {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  mrp?: number;
  discountPercent?: number;
  imageUrls?: string[];
  categoryId: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface CategoryData {
  name: string;
  slug?: string;
  description?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  q?: string;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
