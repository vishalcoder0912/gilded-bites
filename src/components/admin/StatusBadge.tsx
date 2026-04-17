import { cn } from "@/lib/utils";
import type { AdminOrderStatus } from "@/store/adminOrders";

const styles: Record<AdminOrderStatus, string> = {
  pending: "bg-primary/15 text-primary border-primary/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const labels: Record<AdminOrderStatus, string> = {
  pending: "Awaiting",
  approved: "Approved",
  rejected: "Rejected",
};

export const StatusBadge = ({ status }: { status: AdminOrderStatus }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em]",
      styles[status],
    )}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {labels[status]}
  </span>
);
