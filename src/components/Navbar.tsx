import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, LogIn, LogOut, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function MagneticLink({ to, children, isActive }: { to: string; children: React.ReactNode; isActive: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x, y }} className="relative">
      <Link
        ref={ref}
        to={to}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative py-2 uppercase tracking-[0.2em] transition-colors duration-300 ${
          isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
        }`}
      >
        {children}
        {isActive && (
          <motion.span
            layoutId="nav-indicator"
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)",
            }}
          />
        )}
      </Link>
    </motion.div>
  );
}

const Navbar = () => {
  const location = useLocation();
  const { open, getCount, fetchCart } = useCartStore();
  const { isAuthenticated, logout, loadUser } = useAuth();
  const itemCount = getCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/90 backdrop-blur-2xl border-b border-gold/10 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            : "bg-gradient-to-b from-background/80 to-transparent"
        }`}
      >
        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between sm:h-20 lg:h-24">
            <Link to="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-90 blur-[3px]" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-gold shadow-glow">
                  <span className="font-serif text-lg font-semibold text-[#1a0a04] sm:text-xl">N</span>
                </div>
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl animate-pulse" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate font-serif text-lg tracking-wide text-foreground sm:text-2xl lg:text-3xl">
                  Noir Sane
                </div>
                <div className="hidden text-[9px] uppercase tracking-[0.35em] text-gold sm:block sm:text-[10px]">
                  Wholesome Bites
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-10 text-sm lg:flex">
              {navLinks.map((link) => (
                <MagneticLink key={link.href} to={link.href} isActive={location.pathname === link.href}>
                  {link.label}
                </MagneticLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/dashboard"
                    className="hidden h-10 items-center gap-2 rounded-full border border-gold/25 px-4 text-xs uppercase tracking-[0.18em] text-foreground/80 transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-foreground hover:shadow-[0_0_20px_rgba(217,168,95,0.2)] sm:flex"
                    title="Account"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-foreground/80 transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-foreground sm:flex"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden h-10 items-center gap-2 rounded-full border border-gold/25 px-4 text-xs uppercase tracking-[0.18em] text-foreground/80 transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-foreground hover:shadow-[0_0_20px_rgba(217,168,95,0.2)] sm:flex"
                  title="Account"
                >
                  <LogIn className="h-4 w-4" />
                  Account
                </Link>
              )}

              <ThemeToggle />

              <button
                onClick={open}
                aria-label="Open cart"
                className="relative flex h-10 items-center gap-2 rounded-full border border-gold/25 px-3 text-xs uppercase tracking-[0.18em] text-foreground transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(217,168,95,0.2)] sm:px-4"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-[#1a0a04] shadow-[0_2px_8px_rgba(217,168,95,0.4)]">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-foreground transition-all duration-300 hover:border-gold hover:bg-gold/10 lg:hidden"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel fixed inset-x-0 top-16 sm:top-20 z-40 max-h-[calc(100svh-5rem)] overflow-y-auto border-b border-gold/15 p-5 lg:hidden"
          >
            <nav className="grid gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`rounded-sm px-4 py-4 text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive
                        ? "bg-gold/15 text-gold border-l-2 border-gold"
                        : "text-muted-foreground hover:bg-gold/10 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="rounded-sm px-4 py-4 text-sm uppercase tracking-[0.2em] text-muted-foreground hover:bg-gold/10 hover:text-foreground"
              >
                Account
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
