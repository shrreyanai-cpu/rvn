import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingBag, Package, Award } from "lucide-react";

type AnalyticsData = {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  categoryBreakdown: Array<{ category: string; revenue: number; orders: number }>;
  orderStatusBreakdown: Array<{ status: string; count: number }>;
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
  iconBgColor: string;
  iconColor: string;
};

function StatCard({ title, value, icon, isLoading, iconBgColor, iconColor }: StatCardProps) {
  if (isLoading) {
    return <Skeleton className="h-24 rounded-md" />;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/ /g, "-")}`}>
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center shrink-0`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}

const chartColors = ["#2C3E50", "#C9A961", "#34495E", "#D4A574", "#7F8C8D", "#ECF0F1"];

function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md p-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name === "Revenue" ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function CustomBarTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md p-2 shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.name}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          Revenue: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md p-2 shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.name || payload[0].payload.category || payload[0].payload.status}</p>
        <p className="text-sm">{payload[0].name}: {formatCurrency(payload[0].value) || payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  const totalRevenue = analytics?.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) || 0;
  const totalOrders = analytics?.dailyRevenue.reduce((sum, day) => sum + day.orders, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topProduct = analytics?.topProducts[0]?.name || "N/A";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-analytics-title">
          Sales Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive sales performance overview</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={isLoading}
          iconBgColor="bg-[#C9A961]/10"
          iconColor="text-[#C9A961]"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingBag className="h-5 w-5" />}
          isLoading={isLoading}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(avgOrderValue)}
          icon={<Package className="h-5 w-5" />}
          isLoading={isLoading}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-500"
        />
        <StatCard
          title="Top Selling Product"
          value={topProduct}
          icon={<Award className="h-5 w-5" />}
          isLoading={isLoading}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A961" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A961" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C9A961"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={140} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="revenue" fill="#2C3E50" name="Revenue" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : analytics?.orderStatusBreakdown && analytics.orderStatusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.orderStatusBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.orderStatusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
