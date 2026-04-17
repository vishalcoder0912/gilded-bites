import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Check, Copy } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrder, generateOrderId } from "@/store/order";
import { formatINR } from "@/services/products";
import qrImage from "@/assets/upi-qr.jpg";

const UPI_ID = "cocoanoir@upi";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const setOrder = useOrder((s) => s.setCurrent);
  const navigate = useNavigate();

  const [utr, setUtr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = subtotal();
  const shipping = total > 2500 ? 0 : 150;
  const grand = total + shipping;

  useEffect(() => {
    if (items.length === 0) {
      navigate("/shop");
    }
  }, [items.length, navigate]);

  const copyUpi = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (utr.trim().length < 6) {
      setError("Please enter a valid UTR / Transaction ID.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const order = {
        id: generateOrderId(),
        items: [...items],
        amount: grand,
        utr: utr.trim(),
        screenshotName: file?.name,
        createdAt: Date.now(),
      };
      setOrder(order);
      clear();
      navigate("/order-confirmed");
    }, 900);
  };

  if (items.length === 0) return null;

  return (
    <div className="pt-32 pb-24">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="eyebrow mb-3">Final step</p>
          <h1 className="font-serif text-5xl md:text-6xl">Complete your <span className="gold-text italic">order</span></h1>
        </motion.div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          {/* QR + form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="luxe-card p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <div className="eyebrow mb-3">UPI Payment</div>
              <h2 className="font-serif text-3xl mb-2">Scan to pay</h2>
              <p className="text-sm text-muted-foreground">Use any UPI app — GPay, PhonePe, Paytm, BHIM.</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative p-4 bg-cream rounded-sm shadow-glow">
                <img src={qrImage} alt="UPI QR code" width={220} height={220} className="w-[220px] h-[220px] object-cover" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-gold text-abyss text-[10px] uppercase tracking-[0.25em] rounded-full">
                  Scan now
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-4 bg-rich/40 rounded-sm border border-border">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">UPI ID</div>
                  <div className="font-mono text-base mt-1">{UPI_ID}</div>
                </div>
                <button onClick={copyUpi} className="text-xs uppercase tracking-[0.25em] text-primary hover:text-gold-bright flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-rich/40 rounded-sm border border-border">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Amount due</div>
                </div>
                <div className="font-serif text-2xl gold-text">{formatINR(grand)}</div>
              </div>
            </div>

            <div className="hairline mb-8" />

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="utr" className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  UTR / Transaction ID *
                </label>
                <input
                  id="utr"
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 412345678901"
                  required
                  className="w-full bg-rich/40 border border-border px-4 py-3 rounded-sm focus:border-primary focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Payment screenshot (optional)
                </label>
                <label className="flex items-center justify-center gap-3 p-6 border border-dashed border-border rounded-sm hover:border-primary cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate max-w-[220px]">
                    {file ? file.name : "Click to upload screenshot"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? "Confirming..." : "I have paid"}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Your order will be confirmed once payment is verified.
              </p>
            </form>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="luxe-card p-8 h-fit lg:sticky lg:top-28"
          >
            <h3 className="font-serif text-2xl mb-6">Order summary</h3>
            <div className="space-y-4 mb-6">
              {items.map((it) => (
                <div key={it.product.id} className="flex gap-3 items-center">
                  <img src={it.product.image} alt={it.product.name} className="w-14 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{it.product.name}</div>
                    <div className="text-xs text-muted-foreground">× {it.quantity}</div>
                  </div>
                  <div className="text-sm gold-text font-serif">{formatINR(it.product.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="hairline mb-5" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatINR(total)}</span>
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
    </div>
  );
};

export default Checkout;
