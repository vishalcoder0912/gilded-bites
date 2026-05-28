import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bike,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  Truck,
  UserCircle2,
} from "lucide-react";

type DateRange = "7d" | "30d" | "90d";

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  productSummary: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt?: string;
};

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string;
  stock: number;
  status: string;
  sold?: number;
};

type SalesPoint = {
  label: string;
  revenue: number;
};

type StatusBreakdown = {
  label: string;
  value: number;
  color: string;
};

type PaymentVerification = {
  id: string;
  customerName: string;
  method: string;
  amount: number;
  timeAgo: string;
};

type DeliveryStats = {
  readyToShip: number;
  inTransit: number;
  outForDelivery: number;
  deliveredToday: number;
};

type DashboardData = {
  totalRevenue: number;
  revenueGrowth: number;
  ordersToday: number;
  ordersGrowth: number;
  pendingOrders: number;
  lowStockAlerts: number;
  upiPaymentsPending: number;
  upiPendingAmount: number;
  salesOverview: SalesPoint[];
  orderStatusBreakdown: StatusBreakdown[];
  recentOrders: OrderRow[];
  inventory: ProductRow[];
  topProducts: ProductRow[];
  pendingPayments: PaymentVerification[];
  deliveryStats: DeliveryStats;
};

const RAW_API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000";
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/api")
  ? RAW_API_BASE_URL
  : `${RAW_API_BASE_URL}/api`;

const fallbackDashboard: DashboardData = {
  totalRevenue: 0,
  revenueGrowth: 0,
  ordersToday: 0,
  ordersGrowth: 0,
  pendingOrders: 0,
  lowStockAlerts: 0,
  upiPaymentsPending: 0,
  upiPendingAmount: 0,
  salesOverview: [],
  orderStatusBreakdown: [],
  recentOrders: [],
  inventory: [],
  topProducts: [],
  pendingPayments: [],
  deliveryStats: {
    readyToShip: 0,
    inTransit: 0,
    outForDelivery: 0,
    deliveredToday: 0,
  },
};

const statusColors: Record<string, string> = {
  DELIVERED: "#22c55e",
  PROCESSING: "#eab308",
  CONFIRMED: "#eab308",
  SHIPPED: "#3b82f6",
  OUT_FOR_DELIVERY: "#eab308",
  PENDING: "#ef4444",
  CANCELLED: "#6b7280",
  REJECTED: "#ef4444",
  SUBMITTED: "#eab308",
  VERIFIED: "#22c55e",
};

function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): ApiRecord {
  return isRecord(value) ? value : {};
}

function readArray(value: unknown, key: string): unknown[] | undefined {
  const next = asRecord(value)[key];
  return Array.isArray(next) ? next : undefined;
}

function readString(value: unknown, key: string): string | undefined {
  const next = asRecord(value)[key];
  return typeof next === "string" ? next : undefined;
}

async function apiRequest<T>(path: string): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized. Please login again as admin.");
  }

  if (!response.ok) {
    throw new Error(readString(payload, "message") || `API failed with status ${response.status}`);
  }

  return unwrapApiPayload<T>(payload);
}

function unwrapApiPayload<T>(payload: unknown): T {
  const record = asRecord(payload);
  if (record.success === true && "data" in record) return record.data as T;
  if (record.data) return record.data as T;
  return payload as T;
}

function pickArray(payload: unknown, keys: string[] = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    const items = readArray(payload, key);
    if (items) return items;
  }

  return (
    readArray(payload, "items") ||
    readArray(payload, "results") ||
    readArray(payload, "data") ||
    readArray(payload, "orders") ||
    readArray(payload, "products") ||
    []
  );
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}K`;
  return `₹${value}`;
}

function timeAgo(dateValue?: string) {
  if (!dateValue) return "now";

  const date = new Date(dateValue);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getOrderCustomerName(order: unknown) {
  const record = asRecord(order);
  const user = asRecord(record.user);
  const customer = asRecord(record.customer);

  return (
    stringValue(record.customerName) ||
    stringValue(user.name) ||
    stringValue(user.fullName) ||
    stringValue(user.email) ||
    stringValue(customer.name) ||
    "Customer"
  );
}

function getOrderProductSummary(order: unknown) {
  const record = asRecord(order);
  const items = readArray(record, "items") || readArray(record, "orderItems") || [];

  if (items.length > 0) {
    const first = asRecord(items[0]);
    const product = asRecord(first.product);
    const firstName =
      stringValue(first.productNameSnapshot) ||
      stringValue(product.name) ||
      stringValue(first.name) ||
      "Product";

    if (items.length === 1) return firstName;
    return `${firstName} +${items.length - 1} more`;
  }

  return (
    stringValue(record.productName) ||
    stringValue(record.productSummary) ||
    "Chocolate order"
  );
}

function normalizeOrder(order: unknown): OrderRow {
  const record = asRecord(order);

  return {
    id: String(record.id || record._id || record.orderId || crypto.randomUUID()),
    orderNumber: String(
      record.orderNumber || record.transactionId || record.id || "ORDER"
    ),
    customerName: getOrderCustomerName(order),
    productSummary: getOrderProductSummary(order),
    amount: asNumber(
      record.totalAmount ||
        record.amount ||
        record.total ||
        record.grandTotal ||
        0
    ),
    paymentMethod: String(record.paymentMethod || record.paymentType || "UPI"),
    paymentStatus: String(record.paymentStatus || "PENDING"),
    status: String(record.status || "PENDING"),
    createdAt: stringValue(record.createdAt) || stringValue(record.updatedAt),
  };
}

function normalizeProduct(product: unknown): ProductRow {
  const record = asRecord(product);
  const hasProductRelation = isRecord(record.product);
  const prod = hasProductRelation ? asRecord(record.product) : record;
  const stockRecord = hasProductRelation ? record : asRecord(record.stock);

  const images = readArray(prod, "imageUrls") || readArray(prod, "images") || [];
  const firstImage = asRecord(images[0]);

  const stock =
    stockRecord.quantity ??
    prod.stockQuantity ??
    prod.quantity ??
    prod.inventory ??
    prod.stock ??
    0;

  const imageUrl =
    stringValue(prod.imageUrl) ||
    stringValue(prod.thumbnail) ||
    stringValue(firstImage.url) ||
    (typeof images[0] === "string" ? images[0] : "") ||
    "/placeholder.svg";

  const status =
    Number(stock) <= 0
      ? "Out of Stock"
      : Number(stock) <= asNumber(stockRecord.lowStockThreshold || prod.lowStockThreshold, 20)
      ? "Low Stock"
      : "In Stock";

  return {
    id: String(prod.id || record.id || crypto.randomUUID()),
    name: String(prod.name || prod.title || "Chocolate Product"),
    sku: String(prod.sku || prod.slug || "NS-CH"),
    imageUrl,
    stock: asNumber(stock),
    status,
    sold: asNumber(prod.sold || prod.totalSold || prod.salesCount || 0),
  };
}

function buildStatusBreakdown(orders: OrderRow[]): StatusBreakdown[] {
  const map = orders.reduce<Record<string, number>>((acc, order) => {
    const key = order.status || "PENDING";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map).map(([label, value]) => ({
    label,
    value,
    color: statusColors[label] || "#d4a061",
  }));
}

function normalizeDashboard(raw: unknown): DashboardData {
  const record = asRecord(raw);
  const stats = asRecord(record.stats || record.summary || record);
  const deliveryStats = asRecord(record.deliveryStats);

  const orders = pickArray(record.recentOrders || record.orders || [], [
    "recentOrders",
    "orders",
  ]).map(normalizeOrder);

  const products = pickArray(record.inventory || record.products || record.lowStockProducts || [], [
    "inventory",
    "products",
    "lowStockProducts",
  ]).map(normalizeProduct);

  const topProducts = pickArray(record.topProducts || record.topSellingProducts || [], [
    "topProducts",
    "topSellingProducts",
  ]).map(normalizeProduct);

  const pendingPayments =
    pickArray(record.pendingPayments || record.pendingPaymentVerifications || [], [
      "pendingPayments",
      "pendingPaymentVerifications",
    ]).map((payment: unknown) => {
      const paymentRecord = asRecord(payment);
      const user = asRecord(paymentRecord.user);
      const order = asRecord(paymentRecord.order);
      const orderUser = asRecord(order.user);

      return {
      id: String(paymentRecord.id || crypto.randomUUID()),
      customerName:
        stringValue(paymentRecord.customerName) ||
        stringValue(user.name) ||
        stringValue(orderUser.name) ||
        "Customer",
      method: stringValue(paymentRecord.method) || stringValue(paymentRecord.paymentMethod) || "UPI Payment",
      amount: asNumber(paymentRecord.amount || order.totalAmount || 0),
      timeAgo: stringValue(paymentRecord.timeAgo) || timeAgo(stringValue(paymentRecord.createdAt)),
      };
    }) ||
    [];

  const salesOverview =
    pickArray(record.salesOverview || record.sales || [], [
      "salesOverview",
      "sales",
    ]).map((point: unknown, index: number) => {
      const pointRecord = asRecord(point);
      return {
      label: stringValue(pointRecord.label) || stringValue(pointRecord.date) || `Day ${index + 1}`,
      revenue: asNumber(pointRecord.revenue || pointRecord.totalRevenue || pointRecord.amount || 0),
      };
    }) || [];

  const orderStatusBreakdown =
    pickArray(record.orderStatusBreakdown || record.statusBreakdown || [], [
      "orderStatusBreakdown",
      "statusBreakdown",
    ]).map((item: unknown) => {
      const itemRecord = asRecord(item);
      const label = String(itemRecord.label || itemRecord.status || "Pending");

      return {
      label,
      value: asNumber(itemRecord.value || itemRecord.count || 0),
      color: stringValue(itemRecord.color) || statusColors[String(itemRecord.status || itemRecord.label)] || "#d4a061",
      };
    });

  return {
    totalRevenue: asNumber(stats.totalRevenue || stats.revenue),
    revenueGrowth: asNumber(stats.revenueGrowth || stats.revenueGrowthPercent),
    ordersToday: asNumber(stats.ordersToday || stats.todayOrders),
    ordersGrowth: asNumber(stats.ordersGrowth || stats.ordersGrowthPercent),
    pendingOrders: asNumber(
      stats.pendingOrders ||
        orders.filter((o) => ["PENDING", "PROCESSING", "CONFIRMED"].includes(o.status))
          .length
    ),
    lowStockAlerts: asNumber(
      stats.lowStockAlerts ||
        products.filter((p) => p.status === "Low Stock" || p.status === "Out of Stock")
          .length
    ),
    upiPaymentsPending: asNumber(
      stats.upiPaymentsPending ||
        pendingPayments.length ||
        orders.filter((o) =>
          ["PENDING", "SUBMITTED"].includes(o.paymentStatus.toUpperCase())
        ).length
    ),
    upiPendingAmount: asNumber(
      stats.upiPendingAmount ||
        pendingPayments.reduce((sum: number, p: PaymentVerification) => sum + p.amount, 0)
    ),
    salesOverview,
    orderStatusBreakdown: orderStatusBreakdown.length
      ? orderStatusBreakdown
      : buildStatusBreakdown(orders),
    recentOrders: orders,
    inventory: products,
    topProducts: topProducts.length ? topProducts : products.slice(0, 5),
    pendingPayments,
    deliveryStats: {
      readyToShip: asNumber(deliveryStats.readyToShip),
      inTransit: asNumber(deliveryStats.inTransit),
      outForDelivery: asNumber(deliveryStats.outForDelivery),
      deliveredToday: asNumber(deliveryStats.deliveredToday),
    },
  };
}

async function fetchDashboardData(range: DateRange): Promise<DashboardData> {
  try {
    const dashboard = await apiRequest<unknown>(`/admin/dashboard?range=${range}`);
    return normalizeDashboard(dashboard);
  } catch (dashboardError) {
    const [ordersResult, productsResult] = await Promise.allSettled([
      apiRequest<unknown>("/admin/orders?page=1&limit=20"),
      apiRequest<unknown>("/admin/products?page=1&limit=20"),
    ]);

    const ordersPayload =
      ordersResult.status === "fulfilled" ? ordersResult.value : { orders: [] };

    const productsPayload =
      productsResult.status === "fulfilled" ? productsResult.value : { products: [] };

    const orders = pickArray(ordersPayload, ["orders"]).map(normalizeOrder);
    const products = pickArray(productsPayload, ["products"]).map(normalizeProduct);

    const totalRevenue = orders.reduce((sum: number, order: OrderRow) => {
      if (["DELIVERED", "VERIFIED"].includes(order.status.toUpperCase())) {
        return sum + order.amount;
      }
      return sum;
    }, 0);

    return normalizeDashboard({
      totalRevenue,
      ordersToday: orders.length,
      pendingOrders: orders.filter((o: OrderRow) =>
        ["PENDING", "PROCESSING", "CONFIRMED"].includes(o.status.toUpperCase())
      ).length,
      lowStockAlerts: products.filter((p: ProductRow) => p.stock <= 20).length,
      upiPaymentsPending: orders.filter((o: OrderRow) =>
        ["PENDING", "SUBMITTED"].includes(o.paymentStatus.toUpperCase())
      ).length,
      recentOrders: orders,
      inventory: products,
      topProducts: products.slice(0, 5),
      orderStatusBreakdown: buildStatusBreakdown(orders),
    });
  }
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DashboardData>(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (silent = false) => {
      try {
        setError("");
        if (silent) setRefreshing(true);
        else setLoading(true);

        const dashboard = await fetchDashboardData(dateRange);
        setData(dashboard);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load admin dashboard";
        setError(message);

        if (message.toLowerCase().includes("unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, navigate]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data.recentOrders.slice(0, 5);

    return data.recentOrders
      .filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.productSummary.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [data.recentOrders, search]);

  const filteredInventory = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data.inventory.slice(0, 5);

    return data.inventory
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [data.inventory, search]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl text-cream">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-64 rounded-sm border border-gold/20 bg-rich/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary text-cream placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => loadDashboard(true)}
            className="rounded-sm border border-gold/30 p-2 text-muted-foreground hover:text-primary hover:border-gold/50 transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => navigate("/admin/products?action=create")}
            className="inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-abyss shadow-gold hover:shadow-glow transition-shadow"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<IndianRupee size={22} />}
              label="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              subtext={`${data.revenueGrowth >= 0 ? "↑" : "↓"} ${Math.abs(
                data.revenueGrowth
              )}% vs last 7 days`}
              positive={data.revenueGrowth >= 0}
            />

            <MetricCard
              icon={<Package size={22} />}
              label="Orders Today"
              value={String(data.ordersToday)}
              subtext={`${data.ordersGrowth >= 0 ? "↑" : "↓"} ${Math.abs(
                data.ordersGrowth
              )}% vs yesterday`}
              positive={data.ordersGrowth >= 0}
            />

            <MetricCard
              icon={<Clock3 size={22} />}
              label="Pending Orders"
              value={String(data.pendingOrders)}
              subtext="View and fulfill orders"
              onClick={() => navigate("/admin/orders")}
            />

            <MetricCard
              icon={<AlertTriangle size={22} />}
              label="Low Stock Alerts"
              value={String(data.lowStockAlerts)}
              subtext="Products need attention"
              danger
              onClick={() => navigate("/admin/stock")}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel
              title="Sales Overview"
              subtitle={`Last ${dateRange === "7d" ? "7" : dateRange === "30d" ? "30" : "90"} Days`}
            >
              <SalesChart points={data.salesOverview} revenue={data.totalRevenue} />
            </Panel>

            <Panel title="Order Status Breakdown">
              <StatusDonut data={data.orderStatusBreakdown} />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel
              title="Recent Orders"
              action={
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="text-sm text-[#d4a061] hover:text-[#c49050]"
                >
                  View All
                </button>
              }
            >
              <RecentOrdersTable orders={filteredOrders} />
            </Panel>

            <Panel
              title="Product Inventory"
              action={
                <button
                  onClick={() => navigate("/admin/products")}
                  className="text-sm text-[#d4a061] hover:text-[#c49050]"
                >
                  View All
                </button>
              }
            >
              <InventoryTable products={filteredInventory} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  positive,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  positive?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "luxe-card p-5 text-left",
        onClick && "hover:border-primary/50 cursor-pointer"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-gradient-gold/10 p-3 text-primary">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p
            className={cx(
              "mt-1 font-serif text-2xl",
              danger ? "text-red-400" : "text-cream"
            )}
          >
            {value}
          </p>
          <p
            className={cx(
              "mt-1 text-xs",
              positive === true && "text-emerald-400",
              positive === false && "text-red-400",
              positive === undefined && "text-muted-foreground"
            )}
          >
            {subtext}
          </p>
        </div>
      </div>
    </button>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="luxe-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-cream">
            {title}
            {subtitle && (
              <span className="ml-2 font-normal text-muted-foreground">({subtitle})</span>
            )}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SalesChart({
  points,
  revenue,
}: {
  points: SalesPoint[];
  revenue: number;
}) {
  const chartPoints =
    points.length > 0
      ? points
      : [
          { label: "Mon", revenue: revenue * 0.12 || 12000 },
          { label: "Tue", revenue: revenue * 0.09 || 9000 },
          { label: "Wed", revenue: revenue * 0.18 || 18000 },
          { label: "Thu", revenue: revenue * 0.13 || 13000 },
          { label: "Fri", revenue: revenue * 0.16 || 16000 },
          { label: "Sat", revenue: revenue * 0.2 || 20000 },
          { label: "Sun", revenue: revenue * 0.17 || 17000 },
        ];

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;
  const max = Math.max(...chartPoints.map((p) => p.revenue), 1);

  const coords = chartPoints.map((point, index) => {
    const x = paddingX + (index / Math.max(chartPoints.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - (point.revenue / max) * (height - paddingY * 2);
    return { ...point, x, y };
  });

  const polyline = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    `${coords[0]?.x || paddingX},${height - paddingY} ` +
    polyline +
    ` ${coords[coords.length - 1]?.x || width - paddingX},${height - paddingY}`;

  return (
    <div className="h-[200px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        {[0, 1, 2, 3].map((line) => {
          const y = paddingY + line * 40;
          return (
            <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#e8dcc8" strokeDasharray="4" />
          );
        })}

        <polygon points={area} fill="rgba(212,160,97,0.15)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#d4a061"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" fill="#d4a061" />
            <text x={point.x} y={height - 5} fill="#8b6d4a" fontSize="11" textAnchor="middle">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusDonut({ data }: { data: StatusBreakdown[] }) {
  const items =
    data.length > 0
      ? data
      : [
          { label: "Delivered", value: 0, color: "#22c55e" },
          { label: "Processing", value: 0, color: "#eab308" },
          { label: "Shipped", value: 0, color: "#3b82f6" },
          { label: "Pending", value: 0, color: "#ef4444" },
        ];

  const total = items.reduce((sum, item) => sum + item.value, 0);

  let start = 0;
  const conic = items
    .map((item) => {
      const percent = total ? (item.value / total) * 100 : 0;
      const segment = `${item.color} ${start}% ${start + percent}%`;
      start += percent;
      return segment;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 rounded-full">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: total
              ? `conic-gradient(${conic})`
              : "conic-gradient(#e8dcc8 0% 100%)",
          }}
        />
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-sm text-[#8b6d4a]">Total</span>
          <span className="font-serif text-2xl text-[#2d1a0f]">{total}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="text-[#8b6d4a]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrdersTable({ orders }: { orders: OrderRow[] }) {
  const navigate = useNavigate();

  if (!orders.length) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No recent orders found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-gold/20 text-left">
            <th className="pb-3">Order ID</th>
            <th className="pb-3">Customer</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gold/10">
              <td className="py-3 font-mono text-xs text-cream">{order.orderNumber}</td>
              <td className="py-3 text-muted-foreground">{order.customerName}</td>
              <td className="py-3 font-serif gold-text">{formatCurrency(order.amount)}</td>
              <td className="py-3">
                <StatusPill status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryTable({ products }: { products: ProductRow[] }) {
  if (!products.length) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No Noir Sane products are visible yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-gold/20 text-left">
            <th className="pb-3">Product</th>
            <th className="pb-3">Stock</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gold/10">
              <td className="flex items-center gap-3 py-3">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
                <span className="truncate text-cream">{product.name}</span>
              </td>
              <td className="py-3 text-muted-foreground">{product.stock}</td>
              <td className="py-3">
                <StockPill status={product.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const className =
    normalized.includes("DELIVERED")
      ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40"
      : normalized.includes("SHIPPED")
      ? "bg-blue-900/30 text-blue-400 border border-blue-700/40"
      : normalized.includes("PROCESSING") || normalized.includes("CONFIRMED")
      ? "bg-amber-900/30 text-amber-100 border border-amber-700/40"
      : normalized.includes("CANCELLED")
      ? "bg-red-900/30 text-red-400 border border-red-700/40"
      : "bg-primary/20 text-primary border border-primary/40";

  return (
    <span className={cx("rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StockPill({ status }: { status: string }) {
  const className =
    status === "In Stock"
      ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40"
      : status === "Low Stock"
      ? "bg-amber-900/30 text-amber-100 border border-amber-700/40"
      : "bg-red-900/30 text-red-400 border border-red-700/40";

  return (
    <span className={cx("rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      {status}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse luxe-card" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-64 animate-pulse luxe-card" />
        <div className="h-64 animate-pulse luxe-card" />
      </div>
    </div>
  );
}
