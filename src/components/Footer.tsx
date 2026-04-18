import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border mt-32 pt-20 pb-10">
    <div className="container grid md:grid-cols-4 gap-12">
      <div>
        <div className="font-serif text-2xl mb-3">Noir Sane</div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Hand-crafted chocolate, atelier-finished, delivered with care.
        </p>
      </div>
      <div>
        <div className="eyebrow mb-4">Shop</div>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop" className="hover:text-primary">All chocolate</Link></li>
          <li><Link to="/shop" className="hover:text-primary">Truffles</Link></li>
          <li><Link to="/shop" className="hover:text-primary">Single Origin</Link></li>
        </ul>
      </div>
      <div>
        <div className="eyebrow mb-4">Maison</div>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-primary">Our story</a></li>
          <li><a href="#" className="hover:text-primary">Atelier visits</a></li>
          <li><a href="#" className="hover:text-primary">Press</a></li>
        </ul>
      </div>
      <div>
        <div className="eyebrow mb-4">Care</div>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-primary">Shipping</a></li>
          <li><a href="#" className="hover:text-primary">Returns</a></li>
          <li><a href="#" className="hover:text-primary">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="hairline mt-16 mb-6" />
    <div className="container flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
      <span>© {new Date().getFullYear()} Noir Sane. All rights reserved.</span>
      <span className="uppercase tracking-[0.3em]">Crafted in India</span>
    </div>
  </footer>
);

export default Footer;
