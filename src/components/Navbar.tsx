import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { motion } from "framer-motion";

const Navbar = () => {
  const { count, open } = useCart();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const itemCount = count();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        onHome ? "bg-transparent" : "bg-background/80 backdrop-blur-xl border-b border-border"
      }`}
    >
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-gold grid place-items-center shadow-glow">
            <span className="font-serif text-lg text-abyss font-semibold">C</span>
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl tracking-wide">Noir Sane</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Maison · 1899</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm uppercase tracking-[0.25em]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <a href="#story" className="hover:text-primary transition-colors">Atelier</a>
        </nav>

        <button
          onClick={open}
          aria-label="Open cart"
          className="relative p-3 rounded-full border border-border hover:border-primary transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-gold text-abyss text-[10px] font-semibold grid place-items-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </motion.header>
  );
};

export default Navbar;
