import { FormEvent, useState, useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import { useCartStore } from "@/store/cartStore";
import { takePendingCartItem } from "@/lib/pendingCart";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, loadUser, isLoading, error, clearError } = useAuth();
  const { addToCart, open } = useCartStore();
  const routeState = location.state as { from?: string; openCart?: boolean } | null;
  const from = routeState?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any stale error from previous login attempts / session expiry
    clearError();
    setFieldError(null);
    // Check if user is already logged in
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isAuthenticated) {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user?.role === "DELIVERY_PARTNER") {
      return <Navigate to="/delivery" replace />;
    }

    return <Navigate to={from || "/dashboard"} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setFieldError(null);
    setSubmitting(true);
    clearError();

    const result = await login(email, password);

    setSubmitting(false);

    if (!result.ok) {
      setFieldError(result.error);
      return;
    }

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user?.role === "ADMIN") {
      toast({
        title: "Admin login successful",
        description: "Opening admin dashboard.",
      });

      navigate("/admin", { replace: true });
      return;
    }

    if (user?.role === "DELIVERY_PARTNER") {
      navigate("/delivery", { replace: true });
      return;
    }

    toast({
      title: "Welcome back",
      description: "Your account is ready.",
    });

    const pendingItem = takePendingCartItem();

    if (pendingItem) {
      await addToCart(pendingItem.productId, pendingItem.quantity);
    }

    navigate(from || "/dashboard", { replace: true });

    if (routeState?.openCart) {
      window.setTimeout(open, 0);
    }
  };

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#120804]/35 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(25,12,4,0.62),transparent_70%),linear-gradient(135deg,rgba(33,14,6,0.72)_0%,rgba(18,8,4,0.46)_50%,rgba(9,4,2,0.34)_100%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <p className="eyebrow mb-6">Wholesome Bites, Delightful Nights.</p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream leading-tight">
            Return to your <span className="gold-text italic">coffret</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md">
            Sign in to continue your selection, review orders, track delivery, and return to your Noir Sane cart.
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
            <p className="eyebrow mb-3">Customer login</p>
            <h1 className="font-serif text-4xl">Return to your <span className="gold-text italic">coffret</span></h1>
          </div>

          <div className="luxe-card p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-gold grid place-items-center mb-4">
                <span className="font-serif text-2xl text-abyss">N</span>
              </div>
              <p className="eyebrow mb-2">Welcome back</p>
              <p className="text-sm text-muted-foreground">Sign in to continue</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
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
                <label htmlFor="password" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-input border border-border rounded-sm pl-10 pr-10 py-3 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Password"
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
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in</> : "Sign in"}
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              New to Noir Sane?{" "}
              <Link to="/register" state={{ from, openCart: routeState?.openCart }} className="text-primary hover:text-gold-bright">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;
