import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, LogIn, LogOut, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeSelector } from "@/components/ThemeSelector";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Orders", href: "/orders", auth: true },
  { label: "Atelier", href: "/atelier" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const onHome = location.pathname === "/";
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const visibleLinks = navLinks.filter((link) => {
    if (link.auth && !isAuthenticated) return false;
    return true;
  });

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          onHome
            ? scrolled
              ? "glass-card border-b border-[#d7a85f]/15"
              : "bg-transparent"
            : "glass-card border-b border-[#d7a85f]/15"
        }`}
      >
        <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between sm:h-20 lg:h-24">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-90 blur-[2px]" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-gold shadow-glow">
                  <span className="font-serif text-lg font-semibold text-[#1a0a04] sm:text-xl">N</span>
                </div>
              </div>
              <div className="leading-tight">
                <div className="font-serif text-xl text-[#f8eadc] sm:text-2xl lg:text-3xl tracking-wide">
                  Noir Sane
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-[#b88445] hidden sm:block">
                  Maison · 1899
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-10 text-sm">
              {visibleLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative py-2 uppercase tracking-[0.2em] transition-colors duration-300 ${
                      isActive
                        ? "text-[#d9a35b]"
                        : onHome
                        ? "text-[#f8eadc]/80 hover:text-[#f8eadc]"
                        : "text-[#c8b5a4] hover:text-[#f8eadc]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#d9a35b]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <ThemeSelector />
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/addresses"
                    className={`${onHome ? "text-[#f8eadc]/80 hover:text-[#f8eadc]" : "text-[#c8b5a4] hover:text-[#f8eadc]"} hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[#d7a85f]/25 transition-colors hover:border-[#d9a35b] hover:bg-[#d9a35b]/10`}
                    title="My Account"
                  >
                    <User className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={logout}
                    className={`${onHome ? "text-[#f8eadc]/80 hover:text-[#f8eadc]" : "text-[#c8b5a4] hover:text-[#f8eadc]"} hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[#d7a85f]/25 transition-colors hover:border-[#d9a35b] hover:bg-[#d9a35b]/10`}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`${onHome ? "text-[#f8eadc]/80 hover:text-[#f8eadc]" : "text-[#c8b5a4] hover:text-[#f8eadc]"} hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[#d7a85f]/25 transition-colors hover:border-[#d9a35b] hover:bg-[#d9a35b]/10`}
                  title="Sign in"
                >
                  <LogIn className="h-4 w-4" />
                </Link>
              )}

              <button
                onClick={open}
                aria-label="Open cart"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  onHome
                    ? "border-[#d7a85f]/25 text-[#f8eadc] hover:border-[#d9a35b] hover:bg-[#d9a35b]/10"
                    : "border-[#d7a85f]/25 text-[#f8eadc] hover:border-[#d9a35b] hover:bg-[#d9a35b]/10"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d9a35b] text-[10px] font-bold text-[#1a0a04]">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-[#d7a85f]/25 ${
                  onHome ? "text-[#f8eadc]" : "text-[#c8b5a4]"
                }`}
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
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 glass-card border-b border-[#d7a85f]/15 p-5 lg:hidden"
          >
            <nav className="grid gap-1">
              {visibleLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`rounded-sm px-4 py-3 text-sm uppercase tracking-[0.2em] transition-colors ${
                      isActive
                        ? "bg-[#d9a35b]/15 text-[#d9a35b]"
                        : "text-[#c8b5a4] hover:bg-[#d9a35b]/10 hover:text-[#f8eadc]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="rounded-sm px-4 py-3 text-sm uppercase tracking-[0.2em] text-[#c8b5a4] hover:bg-[#d9a35b]/10 hover:text-[#f8eadc]"
                >
                  Sign In
                </Link>
              )}
            </nav>
            <div className="mt-4 flex items-center gap-4 border-t border-[#d7a85f]/15 pt-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#b88445]">Theme</span>
              <ThemeSelector />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
