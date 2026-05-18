import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Cart", to: "/cart" },
  { label: "My Account", to: "/dashboard" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#d7a85f]/15 bg-[#0a0503]/78 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,73,28,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(217,168,95,0.03)_100%)]" />

      <div className="relative mx-auto max-w-[1600px] px-5 pb-10 pt-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr]">
          <div className="lg:pr-8">
            <Link to="/" className="mb-6 inline-flex max-w-full items-center gap-3">
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-gold shadow-[0_4px_20px_rgba(217,168,95,0.3)]">
                  <span className="font-serif text-xl font-semibold text-[#1a0a04]">N</span>
                </div>
                <div className="absolute inset-0 rounded-full bg-[#d9a35b]/30 blur-xl" />
              </div>
              <div className="min-w-0">
                <div className="font-serif text-2xl text-[#f8eadc]">Noir Sane</div>
                <div className="text-[9px] uppercase tracking-[0.35em] text-[#b88445]">
                  Maison de Chocolat
                </div>
              </div>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#a89580]">
              Premium dark chocolate with fruit-jelly inspired fillings, smooth caramel
              notes, and elegant gifting experiences for modern chocolate lovers.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" }
              ].map(({ Icon, label }, index) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7a85f]/20 text-[#c8b5a4] transition-all duration-300 hover:border-[#d9a35b] hover:bg-[#d9a35b]/10 hover:text-[#d9a35b] hover:shadow-[0_4px_20px_rgba(217,168,95,0.2)]"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-px w-6 bg-[#d9a35b]" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#d9a35b]">
                Explore
              </span>
            </div>
            <ul className="grid gap-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group relative inline-block text-sm text-[#a89580] transition-all duration-300 hover:text-[#f8eadc]"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 h-px w-0 bg-[#d9a35b] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-px w-6 bg-[#d9a35b]" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#d9a35b]">
                Contact
              </span>
            </div>
            <ul className="grid gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d9a35b]" />
                <span className="text-sm text-[#a89580]">
                  Premium Chocolate Atelier<br />
                  <span className="text-[#7a6a55]">Mumbai, India</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#d9a35b]" />
                <a href="mailto:care@noirsane.com" className="text-sm text-[#a89580] hover:text-[#f8eadc] transition-colors">
                  care@noirsane.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#d9a35b]" />
                <span className="text-sm text-[#a89580]">Available via Email</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-px w-6 bg-[#d9a35b]" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#d9a35b]">
                Newsletter
              </span>
            </div>
            <p className="mb-4 text-sm text-[#a89580]">
              Receive exclusive offers and new collection announcements.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="luxury-input flex-1 rounded-sm px-4 py-3 text-sm text-[#f8eadc] placeholder:text-[#7a6a55]"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-gold px-5 py-3 text-xs"
              >
                Join
              </motion.button>
            </form>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col items-center justify-between gap-6 border-t border-[#d7a85f]/10 pt-8 text-center sm:flex-row sm:text-left">
          <div>
            <span className="font-serif text-lg text-[#f8eadc]">Noir Sane</span>
            <span className="mx-2 text-[#d7a85f]/40">|</span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a6a55]">Est. 2024</span>
          </div>
          <div className="flex flex-col gap-1 text-center sm:text-right">
            <span className="text-xs text-[#7a6a55]">© {year} Noir Sane. All rights reserved.</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#5a4d40]">Crafted for gifting and mindful indulgence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
