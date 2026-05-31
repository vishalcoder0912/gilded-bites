import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { addressApi, couponApi, orderApi, Address, CouponValidation } from "@/lib/api";
import type { UpiSession } from "@/lib/api";
import { useActiveUpi } from "@/store/catalog";
import AddressForm from "@/components/AddressForm";
import ProductImage from "@/components/ProductImage";
import QRCode from "qrcode";
import { toast } from "sonner";
import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const FREE_DELIVERY_THRESHOLD_PAISE = 250000; // INR 2500
const DELIVERY_CHARGE_PAISE = 15000; // INR 150

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n / 100);

type PaymentMethod = "UPI" | "STRIPE";

interface SuccessState {
  orderId: string;
  amount: number;
  transactionRef?: string;
}

const Checkout = () => {
  const { items, getSubtotal, clearCart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: upiSettings } = useActiveUpi();
  const activeUpi = upiSettings?.[0];
  const upiId = activeUpi?.upiId || "";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [autoQrLoading, setAutoQrLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [upiSession, setUpiSession] = useState<UpiSession | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [qrExpired, setQrExpired] = useState(false);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string | null>(null);
  const [localQrExpiresAt, setLocalQrExpiresAt] = useState<Date | null>(null);
  const [localQrLoading, setLocalQrLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [lockedSummaryItems, setLockedSummaryItems] = useState<typeof items>([]);

  const subtotal = getSubtotal();
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD_PAISE ? 0 : DELIVERY_CHARGE_PAISE;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const estimatedGrand = Math.max(0, subtotal + shipping - discountAmount);
  const payableAmount = upiSession?.amount ?? estimatedGrand;

  const summaryItems = submitted && lockedSummaryItems.length ? lockedSummaryItems : items;
  const hasLiveUpiQr = Boolean(localQrDataUrl || upiSession?.qrDataUrl) && !qrExpired && secondsLeft > 0;

  useEffect(() => {
    if (items.length > 0 && !submitted) {
      setLockedSummaryItems(items);
    }
  }, [items, submitted]);

  useEffect(() => {
    const expiresAt = upiSession?.expiresAt
      ? new Date(upiSession.expiresAt)
      : localQrExpiresAt;

    if (!expiresAt || submitted) {
      setSecondsLeft(0);
      setQrExpired(false);
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      );

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setQrExpired(true);
      }
    };

    tick();

    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [upiSession?.expiresAt, localQrExpiresAt, submitted]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  const loadAddresses = async (preferredId?: string) => {
    try {
      const data = await addressApi.getAddresses();
      setAddresses(data);

      const preferred = preferredId ? data.find((item) => item.id === preferredId) : null;
      const current = selectedAddressId ? data.find((item) => item.id === selectedAddressId) : null;
      const fallback = data.find((item) => item.isDefault) || data[0];

      setSelectedAddressId((preferred || current || fallback)?.id || "");
    } catch (err) {
      console.error("Failed to load addresses:", err);
      toast.error("Unable to load saved addresses.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }

    // selectedAddressId intentionally excluded; this should run once after auth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (items.length === 0 && !submitted) {
      navigate("/shop");
    }
  }, [items.length, navigate, submitted]);

  const copyUpi = async () => {
    const value = upiSession?.upiIdSnapshot || upiId;
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const copyOrderId = async () => {
    if (!success?.orderId) return;

    await navigator.clipboard.writeText(success.orderId);
    toast.success("Order ID copied");
  };

  // Generate a frontend QR immediately on page load so the user sees it without needing an address
  useEffect(() => {
    if (!isAuthenticated) return;
    if (paymentMethod !== "UPI") return;
    if (submitted) return;
    if (upiSession) return;
    if (!upiId) return;
    if (items.length === 0) return;
    if (localQrDataUrl) return;
    if (couponLoading) return;

    const generateLocalQr = async () => {
      setLocalQrLoading(true);
      try {
        const total = Math.max(0, estimatedGrand);
        const amountRupees = (total / 100).toFixed(2);
        const transactionRef = `NS-${Date.now().toString(36).toUpperCase()}`;
        const upiUri =
          `upi://pay?pa=${encodeURIComponent(upiId)}` +
          `&pn=${encodeURIComponent(activeUpi?.displayName || "Noir Sane")}` +
          `&am=${encodeURIComponent(amountRupees)}` +
          `&cu=INR` +
          `&tn=${encodeURIComponent(transactionRef)}`;

        const qrDataUrl = await QRCode.toDataURL(upiUri, {
          width: 300,
          margin: 1,
        });

        setLocalQrDataUrl(qrDataUrl);
        const expires = new Date(Date.now() + 120_000);
        setLocalQrExpiresAt(expires);
        setSecondsLeft(120);
      } catch (err) {
        console.error("Failed to generate QR:", err);
      } finally {
        setLocalQrLoading(false);
      }
    };

    generateLocalQr();
  }, [
    isAuthenticated,
    paymentMethod,
    submitted,
    upiSession,
    upiId,
    items.length,
    localQrDataUrl,
    couponLoading,
    estimatedGrand,
    activeUpi,
  ]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }

    if (upiSession) {
      setCouponError("Coupon cannot be changed after secure QR is generated.");
      toast.error("Coupon is locked after QR generation.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const result = await couponApi.validate(code);
      setAppliedCoupon(result);
      setCouponCode(result.code);
      toast.success(`Coupon ${result.code} applied`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid coupon code.";
      setAppliedCoupon(null);
      setCouponError(message);
      toast.error(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    if (upiSession) {
      toast.error("Coupon cannot be changed after secure QR is generated.");
      return;
    }

    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a shipping address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (paymentMethod === "STRIPE") {
        let couponForOrder = appliedCoupon;

        if (couponCode.trim() && !couponForOrder) {
          couponForOrder = await couponApi.validate(couponCode.trim().toUpperCase());
          setAppliedCoupon(couponForOrder);
          setCouponCode(couponForOrder.code);
          setCouponError("");
        }

        const order = await orderApi.createOrder({
          addressId: selectedAddressId,
          paymentMethod: "STRIPE",
          couponCode: couponForOrder?.code,
        });

        const stripeSession = await orderApi.createStripeCheckout(order.id);
        window.location.href = stripeSession.url;
        return;
      }

      // Create order if not already
      let orderId = createdOrderId;

      if (!orderId) {
        const order = await orderApi.createOrder({
          addressId: selectedAddressId,
          paymentMethod: "UPI",
          couponCode: appliedCoupon?.code,
        });
        orderId = order.id;
        setCreatedOrderId(order.id);
      }

      setSuccess({
        orderId,
        amount: estimatedGrand,
      });

      setSubmitted(true);
      toast.success("Order placed successfully");

      await clearCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewOrder = () => {
    if (success?.orderId || createdOrderId) {
      navigate(`/order-confirmed?id=${success?.orderId || createdOrderId}`);
    }
  };

  const handleContinue = () => {
    navigate("/orders");
  };

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  if (items.length === 0 && !submitted) return null;

  return (
    <PageShell>
      <div className="container max-w-6xl pt-28 pb-24 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-10 text-center"
        >
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="font-serif text-5xl text-[#f8eadc] md:text-6xl">Checkout</h1>
        </motion.div>

        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          {["Address", "Delivery", "Review"].map((step, index) => (
            <div
              key={step}
              className="rounded-sm border border-[#d9a35b]/30 bg-[#140904]/80 p-3 sm:p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9a35b] text-sm font-semibold text-[#090403]">
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm uppercase tracking-[0.18em] text-[#f0c27a] sm:tracking-[0.22em]">
                  {step}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="rounded-sm border border-[#d9a35b]/30 bg-[#140904]/85 p-5 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Shipping</div>
                <h2 className="mb-2 font-serif text-3xl text-[#f8eadc]">
                  Select address
                </h2>
              </div>

              {addresses.length === 0 || showAddressForm ? (
                <AddressForm
                  onAddressCreated={async (id) => {
                    setShowAddressForm(false);
                    await loadAddresses(id);
                    toast.success("Address saved");
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block cursor-pointer rounded-sm border p-4 transition-colors ${
                        selectedAddressId === addr.id
                          ? "border-[#d9a35b]/70 bg-[#d9a35b]/15"
                          : "border-[#d9a35b]/30 bg-[#180c06]/50 hover:border-[#d9a35b]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        disabled={Boolean(upiSession) || submitted}
                        onChange={(event) => setSelectedAddressId(event.target.value)}
                        className="sr-only"
                      />

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-serif text-lg text-[#f8eadc]">
                            {addr.fullName}
                          </div>

                          <div className="mt-1 text-sm leading-6 text-[#d4c4b0]">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </div>

                          <div className="mt-1 text-sm text-[#d4c4b0]">
                            {addr.phone}
                          </div>
                        </div>

                        {selectedAddressId === addr.id && (
                          <Check className="mt-1 h-5 w-5 text-[#d9a35b]" />
                        )}
                      </div>
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    disabled={Boolean(upiSession) || submitted}
                    className="text-sm font-medium uppercase tracking-[0.18em] text-[#f0c27a] hover:text-[#f8eadc] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    + Add new address
                  </button>
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="rounded-sm border border-[#d9a35b]/30 bg-[#140904]/85 p-5 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Delivery</div>
                <h2 className="mb-2 font-serif text-3xl text-[#f8eadc]">
                  Delivery method
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border-2 border-[#d9a35b]/50 bg-[#d9a35b]/12 p-4">
                  <Truck className="mb-3 h-5 w-5 text-[#d9a35b]" />

                  <div className="font-serif text-xl text-[#f8eadc]">
                    Standard Delivery
                  </div>

                  <div className="mt-1 text-sm text-[#d4c4b0]">
                    3-5 business days
                  </div>

                  <div className="mt-3 text-sm font-medium text-[#f0c27a]">
                    {shipping ? formatINR(shipping) : "Complimentary"}
                  </div>
                </div>

                <div className="rounded-sm border border-[#d9a35b]/25 bg-[#180c06]/50 p-4 opacity-60">
                  <PackageCheck className="mb-3 h-5 w-5 text-[#9d6a36]" />

                  <div className="font-serif text-xl text-[#f8eadc]">
                    Express Delivery
                  </div>

                  <div className="mt-1 text-sm text-[#d4c4b0]">
                    1-2 business days
                  </div>

                  <div className="mt-3 text-sm text-[#d4c4b0]">
                    Available soon
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="rounded-sm border border-[#d9a35b]/30 bg-[#140904]/85 p-5 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Payment</div>
                <h2 className="mb-2 font-serif text-3xl text-[#f8eadc]">
                  Choose payment
                </h2>
              </div>

              <div className="mb-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  disabled={Boolean(upiSession) || submitted}
                  className={`rounded-sm border-2 p-4 text-left transition-all ${
                    paymentMethod === "UPI"
                      ? "border-[#d9a35b]/60 bg-[#d9a35b]/12 shadow-[0_0_20px_rgba(217,163,91,0.1)]"
                      : "border-[#d9a35b]/25 bg-[#180c06]/45 hover:border-[#d9a35b]/50 hover:bg-[#180c06]/60"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <QrCode className="mb-3 h-5 w-5 text-[#d9a35b]" />

                  <div className="font-serif text-xl text-[#f8eadc]">UPI QR</div>

                  <p className="mt-1 text-sm text-[#d4c4b0]">
                    Scan and pay via any UPI app.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("STRIPE")}
                  disabled={Boolean(upiSession) || submitted}
                  className={`rounded-sm border-2 p-4 text-left transition-all ${
                    paymentMethod === "STRIPE"
                      ? "border-[#d9a35b]/60 bg-[#d9a35b]/12 shadow-[0_0_20px_rgba(217,163,91,0.1)]"
                      : "border-[#d9a35b]/25 bg-[#180c06]/45 hover:border-[#d9a35b]/50 hover:bg-[#180c06]/60"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <CreditCard className="mb-3 h-5 w-5 text-[#d9a35b]" />

                  <div className="font-serif text-xl text-[#f8eadc]">
                    Card / Stripe
                  </div>

                  <p className="mt-1 text-sm text-[#d4c4b0]">
                    Redirects to secure Stripe checkout.
                  </p>
                </button>
              </div>

              {paymentMethod === "UPI" ? (
                <>
                  <div className="mb-8 rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm uppercase tracking-[0.25em] text-[#d4c4b0]">
                          Coupon
                        </div>
                        <div className="mt-1 font-serif text-xl text-[#f8eadc]">
                          Apply discount
                        </div>
                      </div>

                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          disabled={Boolean(upiSession)}
                          className="text-sm font-medium uppercase tracking-[0.2em] text-red-300 hover:text-red-200 disabled:opacity-50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        type="text"
                        aria-label="Coupon code"
                        value={couponCode}
                        disabled={Boolean(upiSession)}
                        onChange={(event) => {
                          setCouponCode(event.target.value.toUpperCase());
                          setAppliedCoupon(null);
                          setCouponError("");
                        }}
                        placeholder="NOIR10"
                        className="min-w-0 rounded-sm border border-[#d9a35b]/30 bg-[#120804] px-4 py-3 font-mono text-sm uppercase text-[#f8eadc] outline-none transition-colors placeholder:text-[#8a7565] focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || Boolean(upiSession)}
                        className="rounded-sm bg-[#d9a35b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090403] transition hover:brightness-110 hover:shadow-[0_0_15px_rgba(217,163,91,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {couponLoading ? "Checking..." : "Apply"}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="mt-3 rounded-sm border border-emerald-400/30 bg-emerald-500/12 p-3 text-sm text-emerald-200">
                        Coupon {appliedCoupon.code} applied. You saved{" "}
                        <span className="font-semibold">
                          {formatINR(appliedCoupon.discountAmount)}
                        </span>
                        .
                      </div>
                    )}

                    {couponError && (
                      <p className="mt-3 text-sm text-red-300">{couponError}</p>
                    )}

                    {upiSession && (
                      <p className="mt-3 text-sm text-[#d4c4b0]">
                        Coupon is locked because secure payment QR has already been generated.
                      </p>
                    )}
                  </div>

                  <div className="mb-6 flex justify-center">
                    <div className="relative rounded-sm bg-[#f8eadc] p-4 shadow-[0_0_45px_rgba(217,163,91,0.18)]">
                      {localQrLoading || autoQrLoading ? (
                        <div className="grid h-[min(220px,68vw)] w-[min(220px,68vw)] place-items-center text-center text-sm text-[#120804] sm:h-[220px] sm:w-[220px]">
                          Loading secure QR...
                        </div>
                      ) : upiSession?.qrDataUrl && !qrExpired ? (
                        <img
                          src={upiSession.qrDataUrl}
                          alt="Secure UPI QR code"
                          width={220}
                          height={220}
                          className="h-[min(220px,68vw)] w-[min(220px,68vw)] object-cover sm:h-[220px] sm:w-[220px]"
                        />
                      ) : localQrDataUrl && !qrExpired ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={localQrDataUrl}
                            alt="UPI QR code"
                            width={220}
                            height={220}
                            className="h-[min(220px,68vw)] w-[min(220px,68vw)] object-cover sm:h-[220px] sm:w-[220px]"
                          />
                          <p className="mt-3 text-xs font-medium text-[#120804]">
                            Pay {formatINR(estimatedGrand)}
                          </p>
                        </div>
                      ) : (
                        <div className="grid h-[min(220px,68vw)] w-[min(220px,68vw)] place-items-center px-4 text-center text-sm text-[#120804] sm:h-[220px] sm:w-[220px]">
                          {qrExpired ? (
                            "QR expired. Refresh the page to generate a new QR."
                          ) : (
                            "Generating QR..."
                          )}
                        </div>
                      )}

                      <div className="absolute -top-3 left-1/2 max-w-[86%] -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#a66a2e] via-[#f0c27a] to-[#d9a35b] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#090403] sm:tracking-[0.25em]">
                        {qrExpired ? "Expired" : "Scan to pay"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/50 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-[0.25em] text-[#d4c4b0]">
                      <Clock className="h-4 w-4 text-[#d9a35b]" />
                      Payment timer
                    </div>

                    {(localQrDataUrl || upiSession) && !qrExpired ? (
                      <div className="mt-2 font-serif text-3xl text-[#f0c27a]">
                        {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-red-300">
                        {qrExpired
                          ? "QR expired. Refresh the page to generate a new QR."
                          : "Generating QR..."}
                      </div>
                    )}

                    <p className="mt-2 text-sm leading-5 text-[#d4c4b0]">
                      Scan the QR within 2 minutes. After expiry, refresh the page for a new QR.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="mb-8 rounded-sm border border-emerald-400/40 bg-emerald-500/12 p-4 text-sm text-emerald-200">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Payment completed successfully. Your order is awaiting admin
                        verification.
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8 space-y-3">
                      <div className="rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/50 p-4 text-center">
                        <div className="text-sm uppercase tracking-[0.25em] text-[#d4c4b0]">
                          {(upiSession || localQrDataUrl) && !qrExpired
                            ? "Pay the exact amount using any UPI app"
                            : qrExpired
                              ? "QR expired. Refresh the page to continue."
                            : "Generating QR, please wait..."}
                        </div>

                        <p className="mt-2 text-sm leading-5 text-[#d4c4b0]">
                          {(upiSession || localQrDataUrl) && !qrExpired
                            ? "Scan the QR in any UPI app, complete payment, then save your address and place the order."
                            : qrExpired
                              ? "The QR code has expired. Refresh the page to generate a new one."
                            : "Your QR code is being prepared. It will appear in a moment."}
                        </p>
                      </div>

                      <div className="grid gap-3 rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="min-w-0">
                          <div className="text-sm uppercase tracking-[0.25em] text-[#d4c4b0]">
                            UPI ID
                          </div>

                          <div className="mt-1 break-all font-mono text-sm text-[#f8eadc] sm:text-base">
                            {upiSession?.upiIdSnapshot || upiId || "No active UPI"}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={copyUpi}
                          className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-[#f0c27a] hover:text-[#f8eadc] sm:justify-self-end sm:tracking-[0.25em] transition-colors"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>

                      {upiSession?.transactionRef && (
                        <div className="rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/50 p-4">
                          <div className="text-sm uppercase tracking-[0.25em] text-[#d4c4b0]">
                            Transaction Ref
                          </div>

                          <div className="mt-1 font-mono text-sm text-[#f0c27a]">
                            {upiSession.transactionRef}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-8 h-px bg-[#d9a35b]/25" />

                  <div className="mb-8">
                    <p className="text-sm text-[#d4c4b0]">Once you pay, click Place Order & Pay to confirm your order.</p>
                  </div>
                </>
              ) : (
                <div className="rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/50 p-5">
                  <div className="flex items-start gap-4">
                    <CreditCard className="mt-1 h-5 w-5 text-[#d9a35b]" />

                    <div>
                      <h3 className="font-serif text-2xl text-[#f8eadc]">
                        Secure Stripe checkout
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#d4c4b0]">
                        We will create your order with the backend total and redirect
                        you to Stripe to complete payment securely.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  submitted ||
                  localQrLoading ||
                  autoQrLoading ||
                  !selectedAddressId ||
                  submitting
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-[#a66a2e] via-[#f0c27a] to-[#d9a35b] px-5 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#090403] transition-all hover:brightness-110 hover:shadow-[0_0_25px_rgba(217,163,91,0.35)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm sm:tracking-[0.22em]"
              >
                {submitting || autoQrLoading || localQrLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {localQrLoading ? "Preparing QR..." : "Processing..."}
                  </>
                ) : paymentMethod === "UPI" && !selectedAddressId ? (
                  "Save Address First"
                ) : (
                  "Place Order & Pay"
                )}
              </button>
            </motion.section>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="h-fit rounded-sm border border-[#d9a35b]/30 bg-[#140904]/90 p-5 lg:sticky lg:top-28 lg:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="font-serif text-3xl text-[#f8eadc]">
                Order summary
              </h3>

              {selectedAddress && (
                <span className="hidden text-sm uppercase tracking-[0.18em] text-[#d9a35b]/90 sm:inline">
                  {selectedAddress.city}
                </span>
              )}
            </div>

            <div className="mb-6 space-y-4">
              {summaryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <ProductImage
                    product={item.product}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-sm object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[#f8eadc]">
                      {item.product?.name}
                    </div>

                    <div className="text-sm text-[#d4c4b0]">
                      x {item.quantity}
                    </div>
                  </div>

                  <div className="shrink-0 font-serif text-sm text-[#f0c27a]">
                    {formatINR(item.priceSnapshot * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5 h-px bg-[#d9a35b]/25" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#d4c4b0]">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Coupon discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#d4c4b0]">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</span>
              </div>

              <div className="mt-3 flex justify-between border-t border-[#d9a35b]/25 pt-3 font-serif text-2xl">
                <span className="text-[#f8eadc]">
                  {upiSession ? "Payable" : "Estimated total"}
                </span>

                <span className="text-[#f0c27a]">{formatINR(payableAmount)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-sm border border-[#d9a35b]/25 bg-[#180c06]/50 p-4">
              {[
                {
                  icon: Sparkles,
                  title: "Premium ingredients",
                  text: "Finest cocoa, pure & wholesome",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure payments",
                  text: "Encrypted & trusted checkout",
                },
                {
                  icon: PackageCheck,
                  title: "Satisfaction guaranteed",
                  text: "Crafted with care, delivered with love",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <item.icon className="mt-1 h-5 w-5 text-[#d9a35b]" />

                  <div>
                    <div className="text-sm font-medium text-[#f8eadc]">
                      {item.title}
                    </div>

                    <div className="text-sm text-[#d4c4b0]">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#090403]/75 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.28 }}
              className="relative w-full max-w-xl overflow-hidden rounded-md border border-[#d9a35b]/35 bg-[radial-gradient(circle_at_50%_0%,rgba(217,163,91,0.18),transparent_42%),linear-gradient(145deg,#1b0e07,#0b0503_80%)] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.65)] md:p-10"
            >
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="absolute right-5 top-5 text-[#c8b5a4] transition hover:text-[#f8eadc]"
                aria-label="Close payment success popup"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pointer-events-none absolute inset-0 opacity-70">
                <span className="absolute left-[18%] top-[22%] h-1 w-1 rounded-full bg-[#f0c27a]" />
                <span className="absolute right-[18%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#d9a35b]" />
                <span className="absolute left-[26%] bottom-[32%] h-1 w-1 rounded-full bg-[#d9a35b]" />
                <span className="absolute right-[24%] bottom-[38%] h-1 w-1 rounded-full bg-[#f8eadc]" />
              </div>

              <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full border border-[#f0c27a]/70 bg-[#d9a35b]/10 shadow-[0_0_38px_rgba(217,163,91,0.35)]">
                <Check className="h-11 w-11 text-[#f0c27a]" />
              </div>

              <h2 className="font-serif text-4xl text-[#f8eadc] md:text-5xl">
                Payment Successful
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#f8eadc]">
                Your payment of{" "}
                <span className="text-[#f0c27a]">
                  {formatINR(success.amount)}
                </span>{" "}
                has been received successfully.
              </p>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#d4c4b0]">
                Thank you for your purchase. Your order is now awaiting verification.
              </p>

              <div className="mx-auto my-6 h-px max-w-sm bg-[#d9a35b]/25" />

              <button
                type="button"
                onClick={copyOrderId}
                className="mx-auto flex items-center justify-center gap-3 rounded-sm border border-[#d9a35b]/30 bg-[#180c06]/70 px-5 py-4 text-left hover:bg-[#180c06]/80 transition-colors"
              >
                <FileText className="h-5 w-5 text-[#d9a35b]" />

                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-[#d4c4b0]">
                    Order ID
                  </div>

                  <div className="font-mono text-sm text-[#f8eadc]">
                    {success.orderId}
                  </div>
                </div>

                <Copy className="h-4 w-4 text-[#d9a35b]" />
              </button>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleViewOrder}
                  className="rounded-sm border-2 border-[#d9a35b]/50 px-5 py-3 text-sm font-semibold text-[#f8eadc] transition-all hover:border-[#f0c27a] hover:bg-[#d9a35b]/10"
                >
                  View Order
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-sm bg-gradient-to-r from-[#a66a2e] via-[#f0c27a] to-[#d9a35b] px-5 py-3 text-sm font-semibold text-[#090403] transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(217,163,91,0.3)]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default Checkout;
