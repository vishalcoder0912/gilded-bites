import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#d7a85f]/20 bg-[#0a0503]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,73,28,0.15),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pt-16 pb-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="font-serif text-lg font-semibold text-[#1a0a04]">N</span>
              </div>
              <div>
                <div className="font-serif text-xl text-[#f8eadc]">Noir Sane</div>
                <div className="text-[9px] uppercase tracking-[0.35em] text-[#b88445]">Maison · 1899</div>
              </div>
            </Link>
            <p className="text-sm text-[#c8b5a4] max-w-xs leading-relaxed mb-6">
              Hand-crafted chocolate, atelier-finished, delivered with care. Every piece tells a story of origin and passion.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-[#d7a85f]/25 flex items-center justify-center text-[#c8b5a4] hover:border-[#d9a35b] hover:bg-[#d9a35b]/10 hover:text-[#d9a35b] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-[#d7a85f]/25 flex items-center justify-center text-[#c8b5a4] hover:border-[#d9a35b] hover:bg-[#d9a35b]/10 hover:text-[#d9a35b] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-[#d7a85f]/25 flex items-center justify-center text-[#c8b5a4] hover:border-[#d9a35b] hover:bg-[#d9a35b]/10 hover:text-[#d9a35b] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#d9a35b] mb-5 font-medium">
              Shop
            </div>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  All Chocolate
                </Link>
              </li>
              <li>
                <Link to="/shop?category=truffles" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Truffles
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bars" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Chocolate Bars
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pralines" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Pralines
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bonbons" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Bonbons
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#d9a35b] mb-5 font-medium">
              Maison
            </div>
            <ul className="space-y-3">
              <li>
                <Link to="/atelier" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Our Atelier
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Atelier Visits
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Press
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#d9a35b] mb-5 font-medium">
              Care
            </div>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Gift Wrapping
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  Storage Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#c8b5a4] hover:text-[#f8eadc] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-14 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#b88445]">
          <span>© {year} Noir Sane. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#d9a35b] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#d9a35b] transition-colors">Terms of Service</a>
            <span className="uppercase tracking-[0.2em]">Crafted in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
