import { Link } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";

export const formatINRFromPaise = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value / 100);

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`min-h-screen overflow-x-hidden bg-[#090403] text-[#f8eadc] ${className}`}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(157,106,54,0.18),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(217,163,91,0.08),transparent_30%),linear-gradient(180deg,#090403_0%,#120804_48%,#090403_100%)]" />
      {children}
    </main>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-serif text-4xl leading-tight text-[#f8eadc] sm:text-5xl lg:text-6xl">
        {title} {accent && <span className="gold-text italic">{accent}</span>}
      </h2>
      {description && (
        <p className={`mt-4 text-sm leading-relaxed text-[#c8b5a4] sm:text-base ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export function LoadingState({ label = "Preparing the collection..." }: { label?: string }) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/55">
      <div className="flex flex-col items-center gap-4 text-[#c8b5a4]">
        <Loader2 className="h-7 w-7 animate-spin text-[#d9a35b]" />
        <span className="text-xs uppercase tracking-[0.25em]">{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="rounded-sm border border-[#d9a35b]/20 bg-[#180c06]/70 p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-[#d9a35b]/25 bg-[#d9a35b]/10">
        <Sparkles className="h-6 w-6 text-[#d9a35b]" />
      </div>
      <h2 className="font-serif text-3xl text-[#f8eadc]">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#c8b5a4]">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-gold mt-7">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

