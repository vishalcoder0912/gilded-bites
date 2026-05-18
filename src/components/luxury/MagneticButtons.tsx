import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "gold" | "ghost" | "outline";
}

export default function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  variant = "gold",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const buttonClass = {
    gold: "btn-gold gold-glow-button",
    ghost: "btn-ghost-gold",
    outline: "border border-[#d7a85f]/50 text-[#f8eadc] px-6 py-3 text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:border-[#d9a35b] hover:bg-[#d9a35b]/10 hover:shadow-[0_0_20px_rgba(217,168,95,0.2)]",
  }[variant];

  const content = (
    <motion.div style={{ x: xSpring, y: ySpring }} className="flex items-center justify-center gap-2">
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        to={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${buttonClass} magnetic-button inline-flex ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${buttonClass} magnetic-button inline-flex ${className}`}
    >
      {content}
    </motion.button>
  );
}

export function LuxuryCTA({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondCtaText,
  secondCtaLink,
}: {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  secondCtaText?: string;
  secondCtaLink?: string;
}) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-sm p-8 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(217,168,95,0.1),transparent_50%)]" />
      <div className="relative">
        <h3 className="font-serif text-3xl text-[#f8eadc] lg:text-4xl">{title}</h3>
        {subtitle && <p className="mt-3 text-[#a89580]">{subtitle}</p>}
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton href={ctaLink} variant="gold">
            {ctaText}
          </MagneticButton>
          {secondCtaText && secondCtaLink && (
            <MagneticButton href={secondCtaLink} variant="ghost">
              {secondCtaText}
            </MagneticButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function PulseGlow({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute -inset-1 rounded-sm ${className}`}>
      <div className="absolute inset-0 animate-ping rounded-sm bg-[#d9a35b]/20" style={{ animationDuration: "3s" }} />
      <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-[#d9a35b]/10 to-transparent" />
    </div>
  );
}