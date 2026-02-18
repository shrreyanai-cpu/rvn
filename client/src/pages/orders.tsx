import { Link } from "wouter";
import { Package, ArrowLeft, Clock, Truck, CheckCircle, ShoppingBag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Order, OrderItem } from "@shared/schema";

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", icon: Package, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6" data-testid="text-orders-title">
        My Orders
      </h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No orders yet</p>
          <p className="text-muted-foreground text-sm mb-6">Start shopping to see your orders here</p>
          <Link href="/shop">
            <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-start-shopping">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = (order.items as OrderItem[]) || [];
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Card key={order.id} className="p-5" data-testid={`card-order-${order.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-sm">Order #{order.id}</h3>
                      <Badge
                        className={`text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate ${status.className}`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Placed on {new Date(order.createdAt!).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <span className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                    Rs. {Number(order.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                          {item.size ? ` | Size: ${item.size}` : ""}
                        </p>
                      </div>
                      <span className="text-sm font-medium flex-shrink-0">
                        Rs. {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-muted-foreground">+ {items.length - 3} more items</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
