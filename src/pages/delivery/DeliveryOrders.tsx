import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { deliveryApi } from "@/lib/api";
import type { Order } from "@/lib/api";

type OrderStatus = "CONFIRMED" | "OUT_FOR_DELIVERY" | "NEARBY" | "DELIVERED";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "NEARBY", label: "Nearby" },
  { value: "DELIVERED", label: "Delivered" },
];

const DeliveryOrders = () => {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["delivery-orders"],
    queryFn: () => deliveryApi.getOrders(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      deliveryApi.updateStatus(id, status, status.replaceAll("_", " ")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate({ id: orderId, status });
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Operations</p>
        <h1 className="font-serif text-4xl">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update delivery status for assigned orders.
        </p>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxe-card p-5"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div>
                <div className="font-mono text-sm">{order.orderNumber}</div>
                <div className="text-sm mt-1">{order.customerName}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {order.deliveryAddressLine1}, {order.city} - {order.pincode}
                </div>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] px-3 py-1 bg-primary/20 text-primary rounded-full">
                {order.status.replaceAll("_", " ")}
              </span>
            </div>

            {expandedOrder === order.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-2 mb-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Update Status</div>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
                      <button type="button"
                        key={opt.value}
                        onClick={() => handleStatusChange(order.id, opt.value)}
                        disabled={order.status === opt.value || updateStatus.isPending}
                        className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.15em] border transition-colors ${
                          order.status === opt.value
                            ? "bg-primary/15 text-primary border-primary/40"
                            : "border-border hover:border-primary text-muted-foreground hover:text-foreground"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs">
                  <div className="text-muted-foreground mb-1">Items</div>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>{item.productNameSnapshot}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {orders?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No orders assigned.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrders;