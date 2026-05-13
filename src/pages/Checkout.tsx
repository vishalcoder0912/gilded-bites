import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Copy, CreditCard, QrCode, Loader2, PackageCheck, Truck } from "lucide-react";
import QRCode from "qrcode";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { addressApi, orderApi, Address } from "@/lib/api";
import { useActiveUpi } from "@/store/catalog";
import AddressForm from "@/components/AddressForm";
import { toast } from "@/hooks/use-toast";
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
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD">("UPI");

  const subtotal = getSubtotal();
  const shipping = subtotal > 2500 ? 0 : 500;
  const grand = subtotal + shipping;

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

  const upiUri = useMemo(() => {
    const amount = grand.toFixed(2);
    const payee = encodeURIComponent("Noir Sane");
    const note = encodeURIComponent("Noir Sane order");
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${payee}&am=${amount}&cu=INR&tn=${note}`;
  }, [grand, upiId]);

  useEffect(() => {
    QRCode.toDataURL(upiUri, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [upiUri]);

  const copyUpi = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a shipping address.");
      return;
    }
    if (paymentMethod === "UPI" && !utr.trim()) {
      setError("Please enter UTR/Transaction ID.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const order = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod === "UPI" ? "UPI" : "CARD",
        deliveryCharge: shipping || undefined,
      });

      if (paymentMethod === "UPI" && utr.trim()) {
        await orderApi.submitPayment(order.id, utr.trim(), upiId);
      }

      await clearCart();
      setSubmitted(true);
      navigate(`/order-confirmed?id=${order.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
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

        <div className="mb-10 grid gap-3 sm:grid-cols-4">
          {["Address", "Delivery", "Payment", "Review"].map((step, index) => (
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
                <h2 className="font-serif text-3xl text-[#f8eadc] mb-2">Choose payment method</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`border rounded-sm p-4 text-left transition-colors ${
                    paymentMethod === "CARD" ? "border-primary bg-primary/10" : "border-border bg-rich/30 hover:border-primary/60"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-primary mb-3" />
                  <div className="font-serif text-xl">Card</div>
                  <div className="text-xs text-muted-foreground mt-1">Pay with debit/credit card.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`border rounded-sm p-4 text-left transition-colors ${
                    paymentMethod === "UPI" ? "border-primary bg-primary/10" : "border-border bg-rich/30 hover:border-primary/60"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-primary mb-3" />
                  <div className="font-serif text-xl">UPI</div>
                  <div className="text-xs text-muted-foreground mt-1">Pay via UPI app.</div>
                </button>
              </div>

              {paymentMethod === "UPI" && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative p-4 bg-cream rounded-sm shadow-glow">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="UPI QR code" width={220} height={220} className="w-[220px] h-[220px] object-cover" />
                      ) : (
                        <div className="w-[220px] h-[220px] grid place-items-center text-abyss text-sm">QR unavailable</div>
                      )}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-gold text-abyss text-[10px] uppercase tracking-[0.25em] rounded-full">
                        Scan now
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between p-4 bg-rich/40 rounded-sm border border-border">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">UPI ID</div>
                        <div className="font-mono text-base mt-1">{upiId}</div>
                      </div>
                      <button onClick={copyUpi} className="text-xs uppercase tracking-[0.25em] text-primary hover:text-gold-bright flex items-center gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-rich/40 rounded-sm border border-border">
                      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Amount due</div>
                      <div className="font-serif text-2xl gold-text">{formatINR(grand)}</div>
                    </div>
                  </div>

                  <div className="hairline mb-8" />

                  <div className="space-y-5">
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
                  </div>
                </>
              )}

              {error && <p className="text-sm text-destructive mt-4">{error}</p>}

              <button 
                onClick={handlePlaceOrder} 
                disabled={!selectedAddressId || (paymentMethod === "UPI" && !utr) || submitting}
                className="btn-gold w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Place Order"}
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
