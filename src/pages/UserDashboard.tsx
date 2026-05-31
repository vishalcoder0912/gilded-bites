import { type ElementType, useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  LogOut,
  MapPin,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useCartStore } from "@/store/cartStore";
import { addressApi, orderApi, type Address, type Order } from "@/lib/api";
import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const pretty = (value?: string | null) => {
  if (!value) return "Pending";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const activeOrderStatuses = new Set([
  "PLACED",
  "PAYMENT_PENDING",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "NEARBY",
]);

const successfulPaymentStatuses = new Set(["VERIFIED", "PAID"]);

function getPaymentTone(status?: string | null) {
  const value = status || "PENDING";

  if (value === "VERIFIED" || value === "PAID") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (value === "SUBMITTED") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }

  if (value === "REJECTED" || value === "FAILED" || value === "CANCELLED") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-[#d7a85f]/30 bg-[#d7a85f]/10 text-[#f0c27a]";
}

function getOrderTone(status?: string | null) {
  const value = status || "PLACED";

  if (value === "DELIVERED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (value === "OUT_FOR_DELIVERY" || value === "NEARBY") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  }

  if (value === "CANCELLED" || value === "FAILED") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-[#d7a85f]/30 bg-[#d7a85f]/10 text-[#f0c27a]";
}

function getNextStep(order?: Order) {
  if (!order) {
    return {
      title: "Start your first order",
      description: "Explore the atelier and build your first Noir Sane coffret.",
      action: "Shop collection",
      href: "/shop",
    };
  }

  if (order.paymentStatus === "PENDING") {
    return {
      title: "Payment is pending",
      description: "Complete your payment and submit the UTR to move this order forward.",
      action: "Open order",
      href: `/orders/${order.id}`,
    };
  }

  if (order.paymentStatus === "SUBMITTED") {
    return {
      title: "Payment under verification",
      description: "Your UPI reference has been submitted. Our team will verify it shortly.",
      action: "Track order",
      href: `/orders/${order.id}`,
    };
  }

  if (order.status === "OUT_FOR_DELIVERY" || order.status === "NEARBY") {
    return {
      title: "Your order is on the way",
      description: "Track the live delivery progress and delivery updates.",
      action: "Track delivery",
      href: `/orders/${order.id}`,
    };
  }

  if (order.status === "DELIVERED") {
    return {
      title: "Delivered successfully",
      description: "Loved your chocolate experience? Reorder or explore new arrivals.",
      action: "Shop again",
      href: "/shop",
    };
  }

  return {
    title: "Order is being prepared",
    description: "Your order is confirmed and moving through packaging and dispatch.",
    action: "View details",
    href: `/orders/${order.id}`,
  };
}

function StatusPill({
  value,
  type,
}: {
  value?: string | null;
  type: "payment" | "order";
}) {
  const tone = type === "payment" ? getPaymentTone(value) : getOrderTone(value);

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${tone}`}>
      {pretty(value)}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: ElementType;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#100604]/65 p-5 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-full border border-[#d7a85f]/25 bg-[#d7a85f]/10 text-[#f0c27a]">
          <Icon className="h-5 w-5" />
        </div>
        <span className="h-px flex-1 bg-gradient-to-r from-[#d7a85f]/30 to-transparent" />
      </div>

      <div className="font-serif text-3xl text-[#f8eadc]">{value}</div>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#d7a85f]">{label}</p>
      <p className="mt-3 text-sm leading-6 text-[#c8b5a4]">{helper}</p>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: ElementType;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-4 rounded-[1.5rem] border border-[#d7a85f]/15 bg-[#050201]/60 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#d7a85f]/45 hover:bg-[#130805]/80"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d7a85f]/10 text-[#f0c27a]">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg text-[#f8eadc]">{title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-[#c8b5a4]">{text}</p>
      </div>

      <ArrowRight className="h-4 w-4 text-[#d7a85f] transition group-hover:translate-x-1" />
    </Link>
  );
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const firstItems = order.items?.slice(0, 3) || [];

  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#100604]/70 p-5 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#d7a85f]">
            Order placed · {formatDate(order.createdAt)}
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[#f8eadc]">{order.orderNumber}</h3>
          <p className="mt-1 text-sm text-[#c8b5a4]">
            {itemCount} item{itemCount === 1 ? "" : "s"} · {order.paymentMethod}
          </p>
        </div>

        <div className="text-right">
          <div className="font-serif text-2xl text-[#f0c27a]">{formatINR(order.totalAmount)}</div>
          <p className="mt-1 text-xs text-[#c8b5a4]">Total paid/payable</p>
        </div>
      </div>

      <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#d7a85f]/25 to-transparent" />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#c8b5a4]">Order status</p>
          <StatusPill value={order.status} type="order" />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#c8b5a4]">Payment status</p>
          <StatusPill value={order.paymentStatus} type="payment" />
        </div>
      </div>

      {firstItems.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {firstItems.map((item) => (
            <span
              key={item.id}
              className="rounded-full border border-[#d7a85f]/15 bg-[#050201]/70 px-3 py-1.5 text-xs text-[#c8b5a4]"
            >
              {item.productNameSnapshot} x {item.quantity}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#c8b5a4]">
          Ship to {order.city}, {order.state} · {order.pincode}
        </p>

        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#f0c27a] hover:text-[#f8eadc]"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

function AddressPreview({ address }: { address?: Address }) {
  if (!address) {
    return (
      <div className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#100604]/70 p-6">
        <div className="mb-5 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-[#f0c27a]" />
          <h2 className="font-serif text-2xl text-[#f8eadc]">Delivery address</h2>
        </div>

        <p className="text-sm leading-6 text-[#c8b5a4]">
          Add a default delivery address to make checkout faster.
        </p>

        <Link to="/addresses" className="btn-gold mt-6 inline-flex">
          Add address
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#100604]/70 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-[#f0c27a]" />
          <h2 className="font-serif text-2xl text-[#f8eadc]">Default address</h2>
        </div>

        {address.isDefault && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
            Default
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm leading-6 text-[#c8b5a4]">
        <p className="font-medium text-[#f8eadc]">{address.fullName}</p>
        <p>{address.phone}</p>
        <p>
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        </p>
        <p>
          {address.city}, {address.state} · {address.pincode}
        </p>
      </div>

      <Link
        to="/addresses"
        className="mt-6 inline-flex items-center gap-2 text-sm text-[#f0c27a] hover:text-[#f8eadc]"
      >
        Manage addresses
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

const UserDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const itemCount = useCartStore((state) => state.getCount());
  const location = useLocation();

  const {
    data: orders = [],
    isLoading: ordersLoading,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.getOrders(),
    enabled: isAuthenticated,
  });

  const {
    data: addresses = [],
    isLoading: addressesLoading,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
    enabled: isAuthenticated,
  });

  const dashboardData = useMemo(() => {
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const activeOrders = sortedOrders.filter((order) => activeOrderStatuses.has(order.status));
    const completedOrders = sortedOrders.filter((order) => order.status === "DELIVERED");
    const paymentPending = sortedOrders.filter(
      (order) => !successfulPaymentStatuses.has(order.paymentStatus),
    );

    const totalSpent = sortedOrders
      .filter((order) => !["CANCELLED", "FAILED"].includes(order.status))
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];

    return {
      sortedOrders,
      recentOrders: sortedOrders.slice(0, 3),
      activeOrders,
      completedOrders,
      paymentPending,
      totalSpent,
      defaultAddress,
      latestOrder: sortedOrders[0],
    };
  }, [orders, addresses]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const nextStep = getNextStep(dashboardData.latestOrder);

  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 overflow-hidden rounded-[2rem] border border-[#d7a85f]/15 bg-[radial-gradient(circle_at_top_left,rgba(215,168,95,0.18),transparent_36%),rgba(10,4,2,0.82)] p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Customer purchase panel</p>
              <h1 className="font-serif text-5xl leading-tight text-[#f8eadc] sm:text-6xl">
                Welcome back,{" "}
                <span className="gold-text italic">
                  {user?.name?.split(" ")[0] || "Patron"}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#c8b5a4]">
                Track your chocolate orders, payment history, saved addresses,
                delivery progress, and account activity from one premium customer dashboard.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/shop" className="btn-gold">
                  Shop new arrivals
                </Link>

                <Link to="/orders" className="btn-ghost-gold">
                  View all orders
                </Link>

                <button type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.2em] text-[#c8b5a4] transition hover:border-red-400/40 hover:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>

            <div className="w-full rounded-[1.5rem] border border-[#d7a85f]/15 bg-[#050201]/70 p-5 sm:w-[320px]">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#d7a85f]/10 text-[#f0c27a]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#d7a85f]">
                    Next best action
                  </p>
                  <h2 className="font-serif text-xl text-[#f8eadc]">{nextStep.title}</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#c8b5a4]">
                {nextStep.description}
              </p>

              <Link
                to={nextStep.href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#f0c27a] hover:text-[#f8eadc]"
              >
                {nextStep.action}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="Active orders"
            value={ordersLoading ? "..." : dashboardData.activeOrders.length}
            helper="Orders currently being paid, packed, or delivered."
          />
          <StatCard
            icon={WalletCards}
            label="Payment pending"
            value={ordersLoading ? "..." : dashboardData.paymentPending.length}
            helper="Orders that need payment, proof, or verification."
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={ordersLoading ? "..." : dashboardData.completedOrders.length}
            helper="Successfully delivered Noir Sane orders."
          />
          <StatCard
            icon={ReceiptText}
            label="Total purchase"
            value={ordersLoading ? "..." : formatINR(dashboardData.totalSpent)}
            helper="Your lifetime Noir Sane purchase value."
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-[#d7a85f]/15 bg-[#050201]/65 p-6 backdrop-blur-xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d7a85f]">
                    Purchase activity
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-[#f8eadc]">
                    Recent orders
                  </h2>
                </div>

                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 text-sm text-[#f0c27a] hover:text-[#f8eadc]"
                >
                  Full history
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {ordersLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-36 animate-pulse rounded-[1.5rem] bg-[#d7a85f]/10"
                    />
                  ))}
                </div>
              ) : dashboardData.recentOrders.length > 0 ? (
                <div className="grid gap-4">
                  {dashboardData.recentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[#d7a85f]/20 bg-[#100604]/40 p-10 text-center">
                  <Package className="mx-auto h-10 w-10 text-[#d7a85f]" />
                  <h3 className="mt-5 font-serif text-2xl text-[#f8eadc]">
                    No orders yet
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c8b5a4]">
                    Your purchase history will appear here once you place your first chocolate order.
                  </p>
                  <Link to="/shop" className="btn-gold mt-6 inline-flex">
                    Explore the collection
                  </Link>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <QuickAction
                icon={ShoppingBag}
                title="Continue shopping"
                text="Browse fruit-jelly chocolates, truffles, bars, and gift boxes."
                href="/shop"
              />
              <QuickAction
                icon={CreditCard}
                title="Payment history"
                text="Review UPI, Stripe, paid, pending, and verified orders."
                href="/orders"
              />
              <QuickAction
                icon={Truck}
                title="Track delivery"
                text="Open your latest order tracking and delivery status."
                href={dashboardData.latestOrder ? `/orders/${dashboardData.latestOrder.id}` : "/orders"}
              />
              <QuickAction
                icon={Settings}
                title="Account settings"
                text="Manage your customer profile and saved details."
                href="/dashboard"
              />
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#100604]/70 p-6">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#f0c27a]" />
                <h2 className="font-serif text-2xl text-[#f8eadc]">Account summary</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-[#d7a85f]/10 pb-3">
                  <span className="text-[#c8b5a4]">Name</span>
                  <span className="text-right text-[#f8eadc]">{user?.name || "Customer"}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-[#d7a85f]/10 pb-3">
                  <span className="text-[#c8b5a4]">Email</span>
                  <span className="max-w-[180px] truncate text-right text-[#f8eadc]">
                    {user?.email || "Not available"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-[#d7a85f]/10 pb-3">
                  <span className="text-[#c8b5a4]">Cart</span>
                  <Link to="/cart" className="text-[#f0c27a] hover:text-[#f8eadc]">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </Link>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#c8b5a4]">Member status</span>
                  <span className="text-[#f0c27a]">Noir Customer</span>
                </div>
              </div>
            </div>

            {addressesLoading ? (
              <div className="h-64 animate-pulse rounded-[1.75rem] bg-[#d7a85f]/10" />
            ) : (
              <AddressPreview address={dashboardData.defaultAddress} />
            )}

            <div className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#100604]/70 p-6">
              <div className="mb-5 flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-[#f0c27a]" />
                <h2 className="font-serif text-2xl text-[#f8eadc]">Purchase timeline</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: ShoppingBag,
                    title: "Browse",
                    text: "Choose your chocolate collection.",
                  },
                  {
                    icon: CreditCard,
                    title: "Pay",
                    text: "Complete UPI or card payment.",
                  },
                  {
                    icon: Package,
                    title: "Pack",
                    text: "Atelier prepares your order.",
                  },
                  {
                    icon: Truck,
                    title: "Deliver",
                    text: "Track until doorstep delivery.",
                  },
                ].map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="grid h-9 w-9 place-items-center rounded-full border border-[#d7a85f]/25 bg-[#d7a85f]/10 text-[#f0c27a]">
                        <step.icon className="h-4 w-4" />
                      </div>
                      {index < 3 && <span className="h-8 w-px bg-[#d7a85f]/20" />}
                    </div>

                    <div>
                      <h3 className="font-serif text-lg text-[#f8eadc]">{step.title}</h3>
                      <p className="mt-1 text-sm text-[#c8b5a4]">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#d7a85f]/15 bg-[#050201]/70 p-6">
              <div className="mb-5 flex items-center gap-3">
                <Home className="h-5 w-5 text-[#f0c27a]" />
                <h2 className="font-serif text-2xl text-[#f8eadc]">Support</h2>
              </div>

              <p className="text-sm leading-6 text-[#c8b5a4]">
                Need help with payment verification, delivery, or order changes?
                Contact Noir Sane care for assistance.
              </p>

              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 text-sm text-[#f0c27a] hover:text-[#f8eadc]"
              >
                Contact support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
};

export default UserDashboard;
