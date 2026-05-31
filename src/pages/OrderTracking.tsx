import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { orderApi } from "@/lib/api";
import { EmptyState, LoadingState, PageShell } from "@/components/luxury/LuxuryPrimitives";
import { formatINR } from "@/lib/currency";

const timeline = ["Order Confirmed", "Payment Verified", "Processing", "Shipped", "Out for Delivery", "Delivered"];

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrder(id!),
    enabled: Boolean(id),
  });
  const trackingQuery = useQuery({
    queryKey: ["tracking", id],
    queryFn: () => orderApi.getTracking(id!),
    enabled: Boolean(id),
  });

  if (orderQuery.isLoading || trackingQuery.isLoading) {
    return <PageShell className="pt-32"><div className="container py-16"><LoadingState label="Loading tracking..." /></div></PageShell>;
  }

  const order = orderQuery.data;
  const tracking = trackingQuery.data;

  if (!order || !tracking) {
    return <PageShell className="pt-32"><div className="container py-16"><EmptyState title="Tracking unavailable" description="We could not find tracking for this order." actionLabel="View Orders" actionTo="/orders" /></div></PageShell>;
  }

  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Order Tracking</p>
          <h1 className="font-serif text-5xl text-[#f8eadc] sm:text-6xl">Order Tracking</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[270px_1fr_300px]">
          <aside className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6">
            <h2 className="font-serif text-2xl text-[#f8eadc]">Order Details</h2>
            <div className="mt-5 space-y-4 text-sm text-[#c8b5a4]">
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Order Number</span>{order.orderNumber}</div>
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Order Date</span>{new Date(order.createdAt).toLocaleDateString()}</div>
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Payment Method</span>{order.paymentMethod}</div>
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Total Amount</span>{formatINR(order.totalAmount)}</div>
            </div>
          </aside>

          <div className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6">
            <div className="space-y-5">
              {timeline.map((label, index) => {
                const active = index <= Math.max(1, tracking.trackingTimeline.length);
                return (
                  <div key={label} className="grid grid-cols-[32px_1fr_auto] items-center gap-4">
                    <div className={`grid h-8 w-8 place-items-center rounded-full border ${active ? "border-[#6fbf73] bg-[#6fbf73]/15 text-[#6fbf73]" : "border-[#d9a35b]/18 text-[#9d6a36]"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="font-serif text-xl text-[#f8eadc]">{label}</div>
                    <div className="hidden text-xs text-[#c8b5a4] sm:block">{active ? "Updated" : "Pending"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6">
            <Truck className="mb-5 h-7 w-7 text-[#d9a35b]" />
            <h2 className="font-serif text-2xl text-[#f8eadc]">Delivery Partner</h2>
            <div className="mt-5 space-y-4 text-sm text-[#c8b5a4]">
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Partner</span>{tracking.deliveryPartnerName || "Chocolate Express"}</div>
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Tracking ID</span>{order.transactionId}</div>
              <div><span className="block text-xs uppercase tracking-[0.2em] text-[#f0c27a]">Estimated Delivery</span>{tracking.estimatedDeliveryTime || "Preparing ETA"}</div>
              <button type="button" className="btn-ghost-gold w-full px-4 py-3 text-xs"><MapPin className="h-4 w-4" /> View On Map</button>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
