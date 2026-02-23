import { TrendingUp, TrendingDown, ShoppingBag, Package, Users, AlertTriangle, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Order } from "@shared/schema";

type EnhancedStats = {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  avgOrderValue: number;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<EnhancedStats>({
    queryKey: ["/api/admin/enhanced-stats"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const recentOrders = orders?.slice(0, 5) || [];

  const revenueChange = stats && stats.lastMonthRevenue > 0
    ? ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100
    : stats?.thisMonthRevenue ? 100 : 0;
  const revenueGrowth = revenueChange >= 0;

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
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-white" data-testid="text-admin-dashboard-title">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)
        ) : (
          <>
            <Card className="p-5" data-testid="card-today-revenue">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Today's Revenue</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-today-revenue">
                    Rs. {(stats?.todayRevenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#C9A961]/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-[#C9A961]" />
                </div>
              </div>
            </Card>
            <Card className="p-5" data-testid="card-today-orders">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Today's Orders</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-today-orders">
                    {stats?.todayOrders || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </Card>
            <Card className="p-5 border-yellow-300/50 dark:border-yellow-600/30" data-testid="card-pending-orders">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">Pending Orders</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-pending-orders">
                    {stats?.pendingOrders || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </Card>
            <Card className="p-5 border-orange-300/50 dark:border-orange-600/30" data-testid="card-low-stock">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mb-1">Low Stock Products</p>
                  <p className="text-2xl font-bold font-serif text-orange-600 dark:text-orange-400" data-testid="text-low-stock">
                    {stats?.lowStockProducts || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)
        ) : (
          <>
            <Card className="p-5" data-testid="card-total-revenue">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-total-revenue">
                    Rs. {(stats?.totalRevenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#C9A961]/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-[#C9A961]" />
                </div>
              </div>
            </Card>
            <Card className="p-5" data-testid="card-total-orders">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-total-orders">
                    {stats?.totalOrders || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </Card>
            <Card className="p-5" data-testid="card-total-customers">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-total-customers">
                    {stats?.totalCustomers || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </Card>
            <Card className="p-5" data-testid="card-avg-order-value">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-avg-order-value">
                    Rs. {(stats?.avgOrderValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="mb-6">
        {isLoading ? (
          <Skeleton className="h-32 rounded-md" />
        ) : (
          <Card className="p-5" data-testid="card-revenue-comparison">
            <h2 className="font-serif font-semibold text-[#2C3E50] dark:text-white mb-4" data-testid="text-revenue-comparison-title">
              Revenue Comparison
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <p className="text-xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-this-month-revenue">
                  Rs. {(stats?.thisMonthRevenue || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Month</p>
                <p className="text-xl font-bold font-serif text-[#2C3E50] dark:text-white" data-testid="text-last-month-revenue">
                  Rs. {(stats?.lastMonthRevenue || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold ${
                    revenueGrowth
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                  data-testid="text-revenue-change"
                >
                  {revenueGrowth ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {revenueGrowth ? "+" : ""}{revenueChange.toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-5" data-testid="card-recent-orders">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif font-semibold text-[#2C3E50] dark:text-white" data-testid="text-recent-orders">Recent Orders</h2>
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
                  className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/30"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate hidden sm:inline-flex ${sc.className}`}>
                      {sc.label}
                    </Badge>
                    <span className="text-sm font-semibold whitespace-nowrap">Rs. {Number(order.totalAmount).toLocaleString("en-IN")}</span>
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
