import { BarChart3, Package, ShoppingBag, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Order } from "@shared/schema";

type Stats = {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const recentOrders = orders?.slice(0, 5) || [];

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    delivered: { label: "Delivered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-dashboard-title">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)
        ) : (
          <>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-stat-revenue">
                    Rs. {(stats?.totalRevenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#C9A961]/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-[#C9A961]" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-stat-orders">{stats?.totalOrders || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Products</p>
                  <p className="text-2xl font-bold" data-testid="text-stat-products">{stats?.totalProducts || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-2xl font-bold" data-testid="text-stat-customers">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-semibold" data-testid="text-recent-orders">Recent Orders</h2>
          <Link href="/admin/orders">
            <span className="text-sm text-[#C9A961] font-medium cursor-pointer flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/30"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate ${sc.className}`}>
                      {sc.label}
                    </Badge>
                    <span className="text-sm font-semibold">Rs. {Number(order.totalAmount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
