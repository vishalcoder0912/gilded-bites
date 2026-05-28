import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
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
import QRCode from "qrcode";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { api, addressApi, couponApi, orderApi, Address, CouponValidation, getProductImage } from "@/lib/api";
import { useActiveUpi } from "@/store/catalog";
import AddressForm from "@/components/AddressForm";
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

interface UpiSessionState {
  id: string;
  orderId?: string;
  upiIdSnapshot: string;
  payeeName?: string;
  transactionRef: string;
  qrDataUrl: string;
  amount: number;
  upiUri?: string;
  status?: string;
}

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

  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const autoQrStartedRef = useRef(false);
  const [autoQrLoading, setAutoQrLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [upiSession, setUpiSession] = useState<UpiSessionState | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [lockedSummaryItems, setLockedSummaryItems] = useState<typeof items>([]);

  const subtotal = getSubtotal();
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD_PAISE ? 0 : DELIVERY_CHARGE_PAISE;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const estimatedGrand = Math.max(0, subtotal + shipping - discountAmount);
  const payableAmount = upiSession?.amount ?? estimatedGrand;

  const summaryItems = submitted && lockedSummaryItems.length ? lockedSummaryItems : items;

  const canSubmitPayment =
    paymentMethod === "UPI" &&
    Boolean(upiSession) &&
    /^\d{12}$/.test(utr.trim()) &&
    Boolean(proofFile);

  useEffect(() => {
    if (items.length > 0 && !submitted) {
      setLockedSummaryItems(items);
    }
  }, [items, submitted]);

  useEffect(() => {
    let cancelled = false;

    const generatePreviewQr = async () => {
      if (paymentMethod !== "UPI" || upiSession) return;

      if (activeUpi?.qrCodeUrl) {
        setQrDataUrl(activeUpi.qrCodeUrl);
        setQrError("");
        return;
      }

      if (!upiId) {
        setQrDataUrl("");
        setQrError("No active UPI ID is configured by admin.");
        return;
      }

      try {
        const upiUri =
          `upi://pay?pa=${encodeURIComponent(upiId)}` +
          `&pn=${encodeURIComponent(activeUpi?.displayName || "Noir Sane")}` +
          `&cu=INR` +
          `&tn=${encodeURIComponent("Noir Sane Checkout")}`;

        const dataUrl = await QRCode.toDataURL(upiUri, { width: 260, margin: 1 });

        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setQrError("");
        }
      } catch (err) {
        console.error("Failed to generate UPI QR:", err);
        if (!cancelled) {
          setQrDataUrl("");
          setQrError("Unable to generate UPI QR. Please use the UPI ID manually.");
        }
      }
    };

    generatePreviewQr();

    return () => {
      cancelled = true;
    };
  }, [activeUpi?.displayName, activeUpi?.qrCodeUrl, paymentMethod, upiId, upiSession]);

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

  const ensureSecureUpiQr = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (paymentMethod !== "UPI") return;
      if (submitted) return;
      if (upiSession) return;

      if (!selectedAddressId) {
        if (!silent) {
          throw new Error("Please select or save a shipping address before generating QR.");
        }
        return;
      }

      if (!upiId) {
        if (!silent) {
          throw new Error("No active UPI ID is configured by admin.");
        }
        return;
      }

      if (items.length === 0) {
        if (!silent) {
          throw new Error("Your cart is empty.");
        }
        return;
      }

      if (couponLoading) return;

      if (couponCode.trim() && !appliedCoupon) {
        if (!silent) {
          throw new Error("Apply or clear your coupon code before generating QR.");
        }
        return;
      }

      if (autoQrStartedRef.current) return;

      autoQrStartedRef.current = true;
      setAutoQrLoading(true);
      setError("");

      try {
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

        const session = await orderApi.createUpiSession(orderId);

        setUpiSession(session);
        setQrDataUrl(session.qrDataUrl);

        if (!silent) {
          toast.success("Secure UPI QR generated. Pay the exact amount, then submit UTR and screenshot.");
        }
      } catch (err) {
        autoQrStartedRef.current = false;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to generate secure UPI QR.";

        setError(message);

        if (!silent) {
          toast.error(message);
        }
      } finally {
        setAutoQrLoading(false);
      }
    },
    [
      paymentMethod,
      submitted,
      upiSession,
      selectedAddressId,
      upiId,
      items.length,
      createdOrderId,
      couponCode,
      appliedCoupon,
      couponLoading,
    ],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    if (paymentMethod !== "UPI") return;
    if (submitted) return;
    if (upiSession) return;
    if (!upiId) return;
    if (!selectedAddressId) return;
    if (items.length === 0) return;
    if (couponLoading) return;
    if (couponCode.trim() && !appliedCoupon) return;

    ensureSecureUpiQr({ silent: true });
  }, [
    isAuthenticated,
    paymentMethod,
    submitted,
    upiSession,
    upiId,
    selectedAddressId,
    items.length,
    couponCode,
    appliedCoupon,
    couponLoading,
    ensureSecureUpiQr,
  ]);

  const generateBackendUpiQr = async () => {
    await ensureSecureUpiQr({ silent: false });
  };

  const submitUpiPayment = async () => {
    if (!upiSession || !createdOrderId) {
      throw new Error("Generate secure UPI QR before submitting payment.");
    }

    if (!/^\d{12}$/.test(utr.trim())) {
      throw new Error("UTR must be exactly 12 digits.");
    }

    if (!proofFile) {
      throw new Error("Please upload your payment screenshot.");
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(proofFile.type)) {
      throw new Error("Payment screenshot must be PNG, JPG, or WebP.");
    }

    if (proofFile.size > 5 * 1024 * 1024) {
      throw new Error("Payment screenshot must be 5MB or smaller.");
    }

    const upload = await api.upload<{ url: string }>("/uploads/payment-proof", proofFile);

    await orderApi.submitUpiSession(upiSession.id, {
      utr: utr.trim(),
      proofImageUrl: upload.url,
    });

    setSuccess({
      orderId: createdOrderId,
      amount: upiSession.amount,
      transactionRef: upiSession.transactionRef,
    });

    setSubmitted(true);
    toast.success("Payment submitted successfully");

    await clearCart();
  };

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
      if (couponCode.trim() && !appliedCoupon) {
        throw new Error("Apply or clear your coupon code before placing the order.");
      }

      if (paymentMethod === "STRIPE") {
        const order = await orderApi.createOrder({
          addressId: selectedAddressId,
          paymentMethod: "STRIPE",
          couponCode: appliedCoupon?.code,
        });

        const stripeSession = await orderApi.createStripeCheckout(order.id);
        window.location.href = stripeSession.url;
        return;
      }

      if (!upiSession || !createdOrderId) {
        await ensureSecureUpiQr({ silent: false });
        return;
      }

      await submitUpiPayment();
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
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/70 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9a35b] text-sm font-semibold text-[#090403]">
                  {index + 1}
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-[#f0c27a]">
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
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 md:p-8"
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
                          ? "border-[#d9a35b]/60 bg-[#d9a35b]/10"
                          : "border-[#d9a35b]/18 bg-[#180c06]/40 hover:border-[#d9a35b]/45"
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

                          <div className="mt-1 text-sm leading-6 text-[#c8b5a4]">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </div>

                          <div className="mt-1 text-sm text-[#c8b5a4]">
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
                    className="text-sm uppercase tracking-[0.18em] text-[#f0c27a] hover:text-[#f8eadc] disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Delivery</div>
                <h2 className="mb-2 font-serif text-3xl text-[#f8eadc]">
                  Delivery method
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-[#d9a35b]/35 bg-[#d9a35b]/10 p-4">
                  <Truck className="mb-3 h-5 w-5 text-[#d9a35b]" />

                  <div className="font-serif text-xl text-[#f8eadc]">
                    Standard Delivery
                  </div>

                  <div className="mt-1 text-xs text-[#c8b5a4]">
                    3-5 business days
                  </div>

                  <div className="mt-3 text-sm text-[#f0c27a]">
                    {shipping ? formatINR(shipping) : "Complimentary"}
                  </div>
                </div>

                <div className="rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/45 p-4 opacity-75">
                  <PackageCheck className="mb-3 h-5 w-5 text-[#9d6a36]" />

                  <div className="font-serif text-xl text-[#f8eadc]">
                    Express Delivery
                  </div>

                  <div className="mt-1 text-xs text-[#c8b5a4]">
                    1-2 business days
                  </div>

                  <div className="mt-3 text-sm text-[#c8b5a4]">
                    Available soon
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 md:p-8"
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
                  className={`rounded-sm border p-4 text-left transition ${
                    paymentMethod === "UPI"
                      ? "border-[#d9a35b]/45 bg-[#d9a35b]/10"
                      : "border-[#d9a35b]/16 bg-[#180c06]/35 hover:border-[#d9a35b]/45"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <QrCode className="mb-3 h-5 w-5 text-[#d9a35b]" />

                  <div className="font-serif text-xl text-[#f8eadc]">UPI QR</div>

                  <p className="mt-1 text-xs text-[#c8b5a4]">
                    Manual verification with UTR and screenshot.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("STRIPE")}
                  disabled={Boolean(upiSession) || submitted}
                  className={`rounded-sm border p-4 text-left transition ${
                    paymentMethod === "STRIPE"
                      ? "border-[#d9a35b]/45 bg-[#d9a35b]/10"
                      : "border-[#d9a35b]/16 bg-[#180c06]/35 hover:border-[#d9a35b]/45"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <CreditCard className="mb-3 h-5 w-5 text-[#d9a35b]" />

                  <div className="font-serif text-xl text-[#f8eadc]">
                    Card / Stripe
                  </div>

                  <p className="mt-1 text-xs text-[#c8b5a4]">
                    Redirects to secure Stripe checkout.
                  </p>
                </button>
              </div>

              {paymentMethod === "UPI" ? (
                <>
                  <div className="mb-8 rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/40 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-[#c8b5a4]">
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
                          className="text-xs uppercase tracking-[0.2em] text-red-300 hover:text-red-200 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        disabled={Boolean(upiSession)}
                        onChange={(event) => {
                          setCouponCode(event.target.value.toUpperCase());
                          setAppliedCoupon(null);
                          setCouponError("");
                        }}
                        placeholder="NOIR10"
                        className="min-w-0 flex-1 rounded-sm border border-[#d9a35b]/18 bg-[#120804] px-4 py-3 font-mono text-sm uppercase text-[#f8eadc] outline-none transition-colors placeholder:text-[#6d5a4a] focus:border-[#d9a35b]/60 disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || Boolean(upiSession)}
                        className="rounded-sm bg-[#d9a35b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#090403] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {couponLoading ? "Checking..." : "Apply"}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="mt-3 rounded-sm border border-emerald-400/25 bg-emerald-500/10 p-3 text-sm text-emerald-200">
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
                      <p className="mt-3 text-xs text-[#c8b5a4]">
                        Coupon is locked because secure payment QR has already been generated.
                      </p>
                    )}
                  </div>

                  <div className="mb-6 flex justify-center">
                    <div className="relative rounded-sm bg-[#f8eadc] p-4 shadow-[0_0_45px_rgba(217,163,91,0.18)]">
                      {upiSession?.qrDataUrl || qrDataUrl ? (
                        <img
                          src={upiSession?.qrDataUrl || qrDataUrl}
                          alt="UPI QR code"
                          width={220}
                          height={220}
                          className="h-[220px] w-[220px] object-cover"
                        />
                      ) : (
                        <div className="grid h-[220px] w-[220px] place-items-center px-4 text-center text-sm text-[#120804]">
                          {qrError || "Generating QR..."}
                        </div>
                      )}

                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#a66a2e] via-[#f0c27a] to-[#d9a35b] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#090403]">
                        Scan now
                      </div>
                    </div>
                  </div>

                  {submitted ? (
                    <div className="mb-8 rounded-sm border border-emerald-400/35 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Payment completed successfully. Your order is awaiting admin
                        verification.
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8 space-y-3">
                      <div className="rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/40 p-4 text-center">
                        <div className="text-xs uppercase tracking-[0.25em] text-[#c8b5a4]">
                          {upiSession
                            ? "Pay exact backend amount using this QR code"
                            : "Generate secure QR before paying"}
                        </div>

                        <p className="mt-2 text-xs leading-5 text-[#c8b5a4]">
                          {upiSession
                            ? "Scan the QR in any UPI app, complete payment, then submit UTR and screenshot."
                            : "Click Generate Secure UPI QR to create your order and lock the exact amount."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/40 p-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-[#c8b5a4]">
                            UPI ID
                          </div>

                          <div className="mt-1 font-mono text-base text-[#f8eadc]">
                            {upiSession?.upiIdSnapshot || upiId || "No active UPI"}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={copyUpi}
                          className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#f0c27a] hover:text-[#f8eadc]"
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
                        <div className="rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/40 p-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-[#c8b5a4]">
                            Transaction Ref
                          </div>

                          <div className="mt-1 font-mono text-sm text-[#f0c27a]">
                            {upiSession.transactionRef}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-8 h-px bg-[#d9a35b]/16" />

                  <div
                    className={`space-y-5 ${
                      upiSession && !submitted ? "" : "pointer-events-none opacity-50"
                    }`}
                  >
                    <div>
                      <label
                        htmlFor="utr"
                        className="mb-2 block text-xs uppercase tracking-[0.25em] text-[#c8b5a4]"
                      >
                        UTR / Transaction ID *
                      </label>

                      <input
                        id="utr"
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        value={utr}
                        onChange={(event) =>
                          setUtr(event.target.value.replace(/\D/g, "").slice(0, 12))
                        }
                        placeholder="e.g. 412345678901"
                        className="w-full rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/45 px-4 py-3 font-mono text-[#f8eadc] outline-none transition-colors focus:border-[#d9a35b]/60"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="payment-proof"
                        className="mb-2 block text-xs uppercase tracking-[0.25em] text-[#c8b5a4]"
                      >
                        Payment screenshot *
                      </label>

                      <input
                        id="payment-proof"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                        className="w-full rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/45 px-4 py-3 text-sm text-[#f8eadc] file:mr-4 file:rounded-sm file:border-0 file:bg-[#d9a35b] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-[#090403]"
                      />

                      <p className="mt-2 text-xs text-[#c8b5a4]">
                        Upload payment proof. Max 5MB. PNG, JPG, or WebP only.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/40 p-5">
                  <div className="flex items-start gap-4">
                    <CreditCard className="mt-1 h-5 w-5 text-[#d9a35b]" />

                    <div>
                      <h3 className="font-serif text-2xl text-[#f8eadc]">
                        Secure Stripe checkout
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#c8b5a4]">
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
                  autoQrLoading ||
                  !selectedAddressId ||
                  (paymentMethod === "UPI" && Boolean(upiSession) && !canSubmitPayment) ||
                  submitting
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-[#a66a2e] via-[#f0c27a] to-[#d9a35b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#090403] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting || autoQrLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {autoQrLoading ? "Loading secure UPI QR..." : "Processing..."}
                  </>
                ) : paymentMethod === "UPI" && !upiSession ? (
                  "Generate Secure UPI QR"
                ) : paymentMethod === "UPI" ? (
                  "Submit Payment"
                ) : (
                  "Place Order"
                )}
              </button>
            </motion.section>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="h-fit rounded-sm border border-[#d9a35b]/22 bg-[#140904]/82 p-6 lg:sticky lg:top-28"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="font-serif text-3xl text-[#f8eadc]">
                Order summary
              </h3>

              {selectedAddress && (
                <span className="hidden text-xs uppercase tracking-[0.18em] text-[#d9a35b]/80 sm:inline">
                  {selectedAddress.city}
                </span>
              )}
            </div>

            <div className="mb-6 space-y-4">
              {summaryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-sm object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[#f8eadc]">
                      {item.product?.name}
                    </div>

                    <div className="text-xs text-[#c8b5a4]">
                      x {item.quantity}
                    </div>
                  </div>

                  <div className="font-serif text-sm text-[#f0c27a]">
                    {formatINR(item.priceSnapshot * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5 h-px bg-[#d9a35b]/16" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#c8b5a4]">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Coupon discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#c8b5a4]">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</span>
              </div>

              <div className="mt-3 flex justify-between border-t border-[#d9a35b]/16 pt-3 font-serif text-2xl">
                <span className="text-[#f8eadc]">
                  {upiSession ? "Payable" : "Estimated total"}
                </span>

                <span className="text-[#f0c27a]">{formatINR(payableAmount)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-sm border border-[#d9a35b]/14 bg-[#180c06]/38 p-4">
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

                    <div className="text-xs text-[#c8b5a4]">{item.text}</div>
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

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#f8eadc]/90">
                Your payment of{" "}
                <span className="text-[#f0c27a]">
                  {formatINR(success.amount)}
                </span>{" "}
                has been received successfully.
              </p>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#c8b5a4]">
                Thank you for your purchase. Your order is now awaiting verification.
              </p>

              <div className="mx-auto my-6 h-px max-w-sm bg-[#d9a35b]/18" />

              <button
                type="button"
                onClick={copyOrderId}
                className="mx-auto flex items-center justify-center gap-3 rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/60 px-5 py-4 text-left"
              >
                <FileText className="h-5 w-5 text-[#d9a35b]" />

                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#c8b5a4]">
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
                  className="rounded-sm border border-[#d9a35b]/40 px-5 py-3 text-sm font-semibold text-[#f8eadc] transition hover:border-[#f0c27a] hover:bg-[#d9a35b]/10"
                >
                  View Order
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-sm bg-gradient-to-r from-[#a66a2e] via-[#f0c27a] to-[#d9a35b] px-5 py-3 text-sm font-semibold text-[#090403] transition hover:brightness-110"
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
