import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, User, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import { useCartStore } from "@/store/cartStore";
import { takePendingCartItem } from "@/lib/pendingCart";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, clearError } = useAuth();
  const { addToCart, open } = useCartStore();
  const routeState = location.state as { from?: string; openCart?: boolean } | null;
  const from = routeState?.from ?? "/";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);
    setSubmitting(true);
    clearError();
    const result = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      password,
    });
    setSubmitting(false);
    if (result.ok) {
      toast({ title: "Account created", description: "You can now complete your order." });
      const pendingItem = takePendingCartItem();
      if (pendingItem) {
        await addToCart(pendingItem.productId, pendingItem.quantity);
      }
      navigate(from === "/dashboard" ? "/" : from, { replace: true });
      if (routeState?.openCart) {
        window.setTimeout(open, 0);
      }
      return;
    }
    setFieldError(result.error);
  };

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#120804]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(25,12,4,0.8),transparent_70%),linear-gradient(135deg,#210e06_0%,#120804_50%,#090402_100%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <p className="eyebrow mb-6">Join the maison</p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream leading-tight">
            Begin your <span className="gold-text italic">selection</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md">
            Create an account to save your cart, track orders, manage addresses, and discover new Noir Sane collections.
          </p>
          <div className="mt-12">
            <div className="hairline mb-8 w-32" />
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a35b]">Dark chocolate · Fruit-jelly centres</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-10">
            <p className="eyebrow mb-3">Create account</p>
            <h1 className="font-serif text-4xl">Begin your <span className="gold-text italic">selection</span></h1>
          </div>

          <div className="luxe-card p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-gold grid place-items-center mb-4">
                <span className="font-serif text-2xl text-abyss">N</span>
              </div>
              <p className="eyebrow mb-2">Join Noir Sane</p>
              <p className="text-sm text-muted-foreground">Register to begin your chocolate selection</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-3 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-3 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-3 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-input border border-border rounded-sm pl-10 pr-10 py-3 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}

              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account</> : "Create account"}
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" state={{ from, openCart: routeState?.openCart }} className="text-primary hover:text-gold-bright">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Register;
