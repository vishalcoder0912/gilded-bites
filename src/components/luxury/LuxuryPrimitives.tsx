import { Link } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";

export function PageShell({
  children,
  className = "",
  transparent = false,
}: {
  children: React.ReactNode;
  className?: string;
  transparent?: boolean;
}) {
  return (
    <main
      className={`relative isolate min-h-screen overflow-x-hidden ${
        transparent ? "page-shell-transparent bg-transparent text-[#f8eadc]" : "page-shell-solid bg-background text-foreground"
      } ${className}`}
    >
      {!transparent && (
        <>
          <div className="page-shell-base pointer-events-none fixed inset-0 z-0" />
          <div className="page-shell-ambient pointer-events-none fixed inset-0 z-0" />
        </>
      )}
      <div className="relative z-10">{children}</div>
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
