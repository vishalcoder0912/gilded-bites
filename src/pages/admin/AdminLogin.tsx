import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cookie, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAdminAuth, MOCK_ADMIN } from "@/store/adminAuth";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAdminAuth();

  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // small delay for UX
    await new Promise((r) => setTimeout(r, 500));
    const result = signIn(email, password);
    setSubmitting(false);
    if (result.ok === true) {
      toast({ title: "Bienvenue", description: "Signed in to the atelier." });
      navigate(from, { replace: true });
      return;
    }
    setError(result.error);
  };

  const fillDemo = () => {
    setEmail(MOCK_ADMIN.email);
    setPassword(MOCK_ADMIN.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="luxe-card p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-gold grid place-items-center mb-4 glow-gold">
              <Cookie className="w-6 h-6 text-abyss" />
            </div>
            <p className="eyebrow mb-2">Atelier Admin</p>
            <h1 className="font-serif text-3xl md:text-4xl">
              Welcome to <span className="gold-text italic">Noir Sane</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to manage orders and verifications.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block"
              >
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cocoasane.com"
                  className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-3 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block"
              >
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-input border border-border rounded-sm pl-10 pr-10 py-3 text-sm outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive border border-destructive/40 bg-destructive/10 rounded-sm px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                "Enter the atelier"
              )}
            </button>
          </form>

          <div className="hairline my-6" />

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Demo credentials
            </p>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs font-mono text-primary hover:text-gold-bright transition-colors"
            >
              {MOCK_ADMIN.email} · {MOCK_ADMIN.password}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
