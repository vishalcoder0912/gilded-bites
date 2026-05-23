import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Copy, CreditCard, QrCode, Loader2, PackageCheck, Truck } from "lucide-react";
import QRCode from "qrcode";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { api, addressApi, orderApi, Address } from "@/lib/api";
import { useActiveUpi } from "@/store/catalog";
import AddressForm from "@/components/AddressForm";
import { toast } from "sonner";
import { getProductImage } from "@/lib/api";
import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n / 100);

const Checkout = () => {
  const { items, getSubtotal, clearCart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const { data: upiSettings } = useActiveUpi();
  const activeUpi = upiSettings?.[0];
  const upiId = activeUpi?.upiId || "";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "STRIPE">("UPI");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [upiSession, setUpiSession] = useState<{
    id: string;
    upiIdSnapshot: string;
    transactionRef: string;
    qrDataUrl: string;
    amount: number;
  } | null>(null);

  const subtotal = getSubtotal();
  const shipping = subtotal > 2500 ? 0 : 500;
  const grand = subtotal + shipping;

  useEffect(() => {
    let cancelled = false;

    const generateQr = async () => {
      if (paymentMethod !== "UPI") {
        setQrDataUrl("");
        setQrError("");
        return;
      }

      if (activeUpi?.qrCodeUrl) {
        setQrDataUrl(activeUpi.qrCodeUrl);
        setQrError("");
        return;
      }

      if (!upiId) {
        setQrDataUrl("");
        setQrError("No active UPI ID is configured.");
        return;
      }

      try {
        const upiUri =
          `upi://pay?pa=${encodeURIComponent(upiId)}` +
          `&pn=${encodeURIComponent(activeUpi?.displayName || "Noir Sane")}` +
          `&cu=INR` +
          `&tn=${encodeURIComponent("Noir Sane Checkout")}`;

        const dataUrl = await QRCode.toDataURL(upiUri, {
          width: 260,
          margin: 1,
        });

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

    generateQr();

    return () => {
      cancelled = true;
    };
  }, [activeUpi?.displayName, activeUpi?.qrCodeUrl, paymentMethod, upiId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await addressApi.getAddresses();
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    };
    if (isAuthenticated) {
      loadAddresses();
    }
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

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a shipping address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (paymentMethod === "STRIPE") {
        const order = await orderApi.createOrder({
          addressId: selectedAddressId,
          paymentMethod,
          deliveryCharge: shipping || undefined,
        });
        const stripeSession = await orderApi.createStripeCheckout(order.id);
        window.location.href = stripeSession.url;
        return;
      }

      if (paymentMethod === "UPI") {
        if (!upiSession || !createdOrderId) {
          const order = await orderApi.createOrder({
            addressId: selectedAddressId,
            paymentMethod,
            deliveryCharge: shipping || undefined,
          });
          const session = await orderApi.createUpiSession(order.id);

          setCreatedOrderId(order.id);
          setUpiSession(session);
          toast.success("Secure UPI QR generated. Pay the exact amount, then submit UTR and screenshot.");
          return;
        }

        if (!utr.trim()) {
          throw new Error("Please enter UTR / Transaction ID");
        }

        if (!/^\d{12}$/.test(utr.trim())) {
          throw new Error("UTR must be 12 digits");
        }

        if (!proofFile) {
          throw new Error("Please upload your payment screenshot");
        }

        if (proofFile.size > 5 * 1024 * 1024) {
          throw new Error("Payment screenshot must be 5MB or smaller");
        }

        const upload = await api.upload<{ url: string }>("/uploads/payment-proof", proofFile);

        await orderApi.submitUpiSession(upiSession.id, {
          utr: utr.trim(),
          proofImageUrl: upload.url,
        });

        toast.success("Payment submitted for verification");
        await clearCart();
        setSubmitted(true);
        navigate(`/order-confirmed?id=${createdOrderId}`);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitted) return null;

  return (
    <PageShell>
      <div className="container max-w-6xl pt-28 pb-24 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="font-serif text-5xl text-[#f8eadc] md:text-6xl">Checkout</h1>
        </motion.div>

        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          {["Address", "Delivery", "Review"].map((step, index) => (
            <div key={step} className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/70 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9a35b] text-sm font-semibold text-[#090403]">{index + 1}</span>
                <span className="text-xs uppercase tracking-[0.22em] text-[#f0c27a]">{step}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Shipping</div>
                <h2 className="font-serif text-3xl text-[#f8eadc] mb-2">Select address</h2>
              </div>

              {addresses.length === 0 ? (
                <AddressForm onAddressCreated={(id) => {
                  setSelectedAddressId(id);
                  setAddresses(prev => [...prev, { id, isDefault: true }]);
                }} />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 border rounded-sm cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="font-medium">{addr.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div className="text-sm text-muted-foreground">{addr.phone}</div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId("");
                    }}
                    className="text-sm text-primary hover:text-gold-bright"
                  >
                    + Add new address
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Delivery</div>
                <h2 className="font-serif text-3xl text-[#f8eadc] mb-2">Delivery method</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-[#d9a35b]/30 bg-[#d9a35b]/10 p-4">
                  <Truck className="mb-3 h-5 w-5 text-[#d9a35b]" />
                  <div className="font-serif text-xl text-[#f8eadc]">Standard Delivery</div>
                  <div className="mt-1 text-xs text-[#c8b5a4]">3-5 business days</div>
                  <div className="mt-3 text-sm text-[#f0c27a]">{shipping ? formatINR(shipping) : "Complimentary"}</div>
                </div>
                <div className="rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/45 p-4 opacity-75">
                  <PackageCheck className="mb-3 h-5 w-5 text-[#9d6a36]" />
                  <div className="font-serif text-xl text-[#f8eadc]">Express Delivery</div>
                  <div className="mt-1 text-xs text-[#c8b5a4]">1-2 business days</div>
                  <div className="mt-3 text-sm text-[#c8b5a4]">Available soon</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 md:p-8"
            >
              <div className="mb-8">
                <div className="eyebrow mb-3">Payment</div>
                <h2 className="font-serif text-3xl text-[#f8eadc] mb-2">Choose payment</h2>
              </div>

              <div className="mb-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  disabled={Boolean(upiSession)}
                  className={`rounded-sm border p-4 text-left transition ${
                    paymentMethod === "UPI"
                      ? "border-[#d9a35b]/45 bg-[#d9a35b]/10"
                      : "border-border bg-rich/35 hover:border-primary/60"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <QrCode className="mb-3 h-5 w-5 text-[#d9a35b]" />
                  <div className="font-serif text-xl text-[#f8eadc]">UPI QR</div>
                  <p className="mt-1 text-xs text-muted-foreground">Manual verification with UTR and screenshot.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("STRIPE")}
                  disabled={Boolean(upiSession)}
                  className={`rounded-sm border p-4 text-left transition ${
                    paymentMethod === "STRIPE"
                      ? "border-[#d9a35b]/45 bg-[#d9a35b]/10"
                      : "border-border bg-rich/35 hover:border-primary/60"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <CreditCard className="mb-3 h-5 w-5 text-[#d9a35b]" />
                  <div className="font-serif text-xl text-[#f8eadc]">Card / Stripe</div>
                  <p className="mt-1 text-xs text-muted-foreground">Redirects to secure Stripe checkout.</p>
                </button>
              </div>

              {paymentMethod === "UPI" ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative p-4 bg-cream rounded-sm shadow-glow">
                      {(qrDataUrl || upiSession?.qrDataUrl) ? (
                        <img 
                          src={upiSession?.qrDataUrl || qrDataUrl} 
                          alt="UPI QR code" 
                          width={220} 
                          height={220} 
                          className="w-[220px] h-[220px] object-cover" 
                        />
                      ) : (
                        <div className="w-[220px] h-[220px] grid place-items-center px-4 text-center text-abyss text-sm">
                          {qrError || "Generating QR..."}
                        </div>
                      )}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-gold text-abyss text-[10px] uppercase tracking-[0.25em] rounded-full">
                        Scan now
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="rounded-sm border border-border bg-rich/40 p-4 text-center">
                      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {upiSession ? "Pay exact backend amount using this QR code" : "Generate secure QR before paying"}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {upiSession
                          ? "Scan the QR in any UPI app, complete payment, then submit UTR and screenshot."
                          : "Click Generate Secure UPI QR to create your order and lock the exact amount."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-rich/40 rounded-sm border border-border">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">UPI ID</div>
                        <div className="font-mono text-base mt-1">{upiSession?.upiIdSnapshot || upiId}</div>
                      </div>
                      <button
                        type="button"
                        onClick={copyUpi}
                        className="text-xs uppercase tracking-[0.25em] text-primary hover:text-gold-bright flex items-center gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {upiSession?.transactionRef && (
                      <div className="flex items-center justify-between p-4 bg-rich/40 rounded-sm border border-border">
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Transaction Ref</div>
                          <div className="font-mono text-sm mt-1 text-primary">{upiSession.transactionRef}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hairline mb-8" />

                  <div className={`space-y-5 ${upiSession ? "" : "pointer-events-none opacity-50"}`}>
                    <div>
                      <label htmlFor="utr" className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                        UTR / Transaction ID *
                      </label>
                      <input
                        id="utr"
                        type="text"
                        value={utr}
                        onChange={(event) => setUtr(event.target.value)}
                        placeholder="e.g. 412345678901"
                        className="w-full bg-rich/40 border border-border px-4 py-3 rounded-sm focus:border-primary focus:outline-none transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="payment-proof" className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                        Payment screenshot *
                      </label>
                      <input
                        id="payment-proof"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                        className="w-full rounded-sm border border-border bg-rich/40 px-4 py-3 text-sm text-[#f8eadc] file:mr-4 file:rounded-sm file:border-0 file:bg-[#d9a35b] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-[#090403]"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Upload payment proof. Max 5MB. PNG, JPG, or WebP only.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-sm border border-border bg-rich/40 p-5">
                  <div className="flex items-start gap-4">
                    <CreditCard className="mt-1 h-5 w-5 text-[#d9a35b]" />
                    <div>
                      <h3 className="font-serif text-2xl text-[#f8eadc]">Secure Stripe checkout</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        We will create your order with the backend total and redirect you to Stripe to complete payment securely.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive mt-4">{error}</p>}

              <button 
                onClick={handlePlaceOrder} 
                disabled={!selectedAddressId || (paymentMethod === "UPI" && Boolean(upiSession) && (!utr.trim() || !proofFile)) || submitting}
                className="btn-gold w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : paymentMethod === "UPI" && !upiSession ? (
                  "Generate Secure UPI QR"
                ) : paymentMethod === "UPI" ? (
                  "Submit Payment for Verification"
                ) : (
                  "Place Order"
                )}
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-fit rounded-sm border border-[#d9a35b]/22 bg-[#140904]/82 p-6 lg:sticky lg:top-28"
          >
            <h3 className="font-serif text-3xl text-[#f8eadc] mb-6">Order summary</h3>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={getProductImage(item.product)} alt={item.product.name} className="w-14 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.product?.name}</div>
                    <div className="text-xs text-muted-foreground">x {item.quantity}</div>
                  </div>
                  <div className="text-sm gold-text font-serif">{formatINR(item.priceSnapshot * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="hairline mb-5" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between font-serif text-2xl pt-3 border-t border-border mt-3">
                <span>Total</span><span className="gold-text">{formatINR(grand)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
};

export default Checkout;
