import { useState } from "react";
import { Link } from "wouter";
import { Search, Eye, Truck, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem, ShippingAddress } from "@shared/schema";

type OrderWithCustomer = Order & { customerName?: string; customerEmail?: string };

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  const { data: orders, isLoading } = useQuery<OrderWithCustomer[]>({ queryKey: ["/api/admin/orders"] });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Order status updated" });
    },
  });

  const shipMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", "/api/admin/delhivery/create-shipment", { orderId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      if (data.success) {
        toast({ title: "Shipment created", description: `Waybill: ${data.waybill}` });
      } else {
        toast({ title: "Shipment failed", description: "Check Delhivery settings", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Failed to create shipment", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      setDeletingOrderId(orderId);
      await apiRequest("DELETE", `/api/admin/orders/${orderId}`);
    },
    onSuccess: () => {
      setDeletingOrderId(null);
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Order deleted" });
    },
    onError: () => {
      setDeletingOrderId(null);
      toast({ title: "Failed to delete order", variant: "destructive" });
    },
  });

  const filtered = orders?.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        o.id.toString().includes(s) ||
        (o.customerName || "").toLowerCase().includes(s) ||
        (o.customerEmail || "").toLowerCase().includes(s)
      );
    }
    return true;
  }) || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-orders-title">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders?.length || 0} total orders</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order #, customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="input-search-orders" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-order-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center"><p className="text-muted-foreground">No orders found</p></Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const items = (order.items as OrderItem[]) || [];
                const sc = statusConfig[order.status] || statusConfig.pending;
                return (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell><span className="font-medium text-sm">#{order.id}</span></TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/customers/${order.userId}`}
                        className="text-sm font-medium text-[#C9A961] hover:underline"
                        data-testid={`link-order-customer-${order.id}`}
                      >
                        {order.customerName || "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{new Date(order.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </TableCell>
                    <TableCell><span className="text-sm font-medium">Rs. {Number(order.totalAmount).toLocaleString("en-IN")}</span></TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })} >
                        <SelectTrigger className="h-7 w-[120px] text-xs" data-testid={`select-order-status-${order.id}`}>
                          <Badge className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate ${sc.className}`}>{sc.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)} data-testid={`button-view-order-${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" disabled={deletingOrderId === order.id} data-testid={`button-admin-delete-order-${order.id}`}>
                              {deletingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Order #{order.id}?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this order. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteOrderMutation.mutate(order.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Customer</span>
                <Link href={`/admin/customers/${selectedOrder.userId}`} className="text-sm font-medium text-[#C9A961] hover:underline" data-testid="link-order-detail-customer">
                  {selectedOrder.customerName || "Unknown"}
                </Link>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={`text-xs border-0 no-default-hover-elevate no-default-active-elevate ${(statusConfig[selectedOrder.status] || statusConfig.pending).className}`}>
                  {(statusConfig[selectedOrder.status] || statusConfig.pending).label}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{new Date(selectedOrder.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Payment</span>
                <Badge className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate ${selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                  {selectedOrder.paymentStatus === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-bold">Rs. {Number(selectedOrder.totalAmount).toLocaleString("en-IN")}</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {((selectedOrder.items as OrderItem[]) || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-12 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium shrink-0">Rs. {Number(item.price).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.shippingAddress ? (() => {
                const addr = selectedOrder.shippingAddress as any;
                const addrName = addr.fullName || `${addr.firstName || ""} ${addr.lastName || ""}`.trim();
                return (
                  <div>
                    <p className="text-sm font-medium mb-2">Shipping Address</p>
                    <div className="p-3 rounded-md bg-muted/30 text-sm">
                      <p className="font-medium">{addrName}</p>
                      <p className="text-muted-foreground">{addr.address}</p>
                      <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-muted-foreground">Phone: {addr.phone}</p>
                    </div>
                  </div>
                );
              })() : null}
              {(selectedOrder as any).delhiveryWaybill ? (
                <div>
                  <p className="text-sm font-medium mb-2">Tracking</p>
                  <div className="p-3 rounded-md bg-muted/30 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Waybill</span>
                      <span className="font-mono text-xs">{(selectedOrder as any).delhiveryWaybill}</span>
                    </div>
                    {(selectedOrder as any).delhiveryStatus && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Status</span>
                        <span>{(selectedOrder as any).delhiveryStatus}</span>
                      </div>
                    )}
                    {(selectedOrder as any).trackingUrl && (
                      <a href={(selectedOrder as any).trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#C9A961] hover:underline mt-1" data-testid="link-tracking">
                        Track on Delhivery <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                selectedOrder.paymentStatus === "paid" && selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => shipMutation.mutate(selectedOrder.id)}
                    disabled={shipMutation.isPending}
                    data-testid="button-ship-delhivery"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    {shipMutation.isPending ? "Creating Shipment..." : "Ship with Delhivery"}
                  </Button>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}