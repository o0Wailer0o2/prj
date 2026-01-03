import { createInfiniteOrdersQueryOptions } from "@/lib/tanstack/options/order";
import type { OrderDTO, OrderItemDTO, OrderStatus } from "@/lib/types/order";
import { useAuthStore } from "@/stores/auth-store";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_shop/my-order")({
  component: RouteComponent
});

const ALL_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "RETURNED"];

export function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function OrderFilterBar({
  value,
  onChange
}: {
  value: OrderStatus[];
  onChange: (v: OrderStatus[]) => void;
}) {
  const toggle = (status: OrderStatus) => {
    onChange(value.includes(status) ? value.filter((s) => s !== status) : [...value, status]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_STATUSES.map((status) => (
        <Badge
          key={status}
          variant={value.includes(status) ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => toggle(status)}
        >
          {status}
        </Badge>
      ))}
    </div>
  );
}

export function OrderCard({ order, onClick }: { order: OrderDTO; onClick: () => void }) {
  return (
    <Card className="cursor-pointer transition hover:shadow-sm" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Order #{order.code}</CardTitle>
          <Badge>{order.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex justify-between text-sm">
        <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
        <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
      </CardContent>
    </Card>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios/instance";

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange
}: {
  orderId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/get", {
        params: { id: orderId }
      });
      return res.data.result as OrderDTO & { items: any[] };
    },
    enabled: !!orderId
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isLoading ? "Loading…" : `Order #${order?.code}`}</DialogTitle>
        </DialogHeader>

        {isLoading || !order ? (
          <p className="text-muted-foreground text-sm">Loading order…</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <Badge>{order.status}</Badge>
            </div>

            <div className="flex justify-between">
              <span>Order Date</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-semibold">${order.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold">${order.deliveryFee.toFixed(2)}</span>
            </div>

            {/* ITEMS */}
            <div className="space-y-2 border-t pt-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span>${(item.unitPrice ?? 0 * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* SHIPPING */}
            <div className="text-muted-foreground space-y-1 border-t pt-3">
              <p>{order.shippingStreet}</p>
              <p>
                {order.shippingCity}, {order.shippingDistrict}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RouteComponent() {
  const userId = useAuthStore((s) => s.userId);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [statuses, setStatuses] = useState<OrderStatus[]>([
    "COMPLETED",
    "PENDING",
    "PROCESSING",
    "RETURNED",
    "CANCELLED"
  ]);
  const { data, isLoading } = useInfiniteQuery({
    ...createInfiniteOrdersQueryOptions({
      opts: {
        userId: userId ?? undefined,
        status: statuses
      }
    }),
    enabled: !!userId
  });

  const orders = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((o) => o.items ?? []);
  }, [data]);
  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-6">
      <OrderFilterBar value={statuses} onChange={setStatuses} />

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

      {orders.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm">No orders found</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
        ))}
      </div>

      <OrderDetailDialog
        orderId={selectedOrder?.id ?? null}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}
