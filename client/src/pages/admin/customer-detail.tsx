import { useState } from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag,
  IndianRupee, Pencil, Loader2, Shield, ExternalLink, Truck, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem } from "@shared/schema";

type CustomerDetail = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
  savedShippingAddress: any;
  orderCount: number;
  totalSpent: number;
  orders: Order[];
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
}: {
  customer: CustomerDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    email: customer.email || "",
    phone: customer.phone || "",
    isAdmin: customer.isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/admin/customers/${customer.id}`, {
        ...form,
        phone: form.phone || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers", customer.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Customer updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to update customer", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                data-testid="input-edit-first-name"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                data-testid="input-edit-last-name"
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              data-testid="input-edit-email"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
              data-testid="input-edit-phone"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Admin Access</Label>
              <p className="text-xs text-muted-foreground">Grant admin panel access</p>
            </div>
            <Switch
              checked={form.isAdmin}
              onCheckedChange={(checked) => setForm({ ...form, isAdmin: checked })}
              data-testid="switch-edit-admin"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !form.firstName || !form.email}
              className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
              data-testid="button-save-customer-edit"
            >
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCustomerDetail() {
  const [, params] = useRoute("/admin/customers/:id");
  const customerId = params?.id;
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: customer, isLoading } = useQuery<CustomerDetail>({
    queryKey: ["/api/admin/customers", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/customers/${customerId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Customer not found</p>
        <Link href="/admin/customers">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const initials = `${(customer.firstName || "")[0] || ""}${(customer.lastName || "")[0] || ""}`.toUpperCase() || "U";
  const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "No Name";

  const paidOrders = customer.orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders = customer.orders.filter((o) => o.status === "pending" || o.status === "confirmed");
  const deliveredOrders = customer.orders.filter((o) => o.status === "delivered");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon" data-testid="button-back-customers"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold truncate" data-testid="text-customer-name">{fullName}</h1>
          <p className="text-sm text-muted-foreground">Customer since {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)} data-testid="button-edit-customer">
          <Pencil className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#C9A961]/10">
              <ShoppingBag className="h-5 w-5 text-[#C9A961]" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-orders">{customer.orderCount}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
              <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-spent">Rs. {customer.totalSpent.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-pending-orders">{pendingOrders.length}</p>
              <p className="text-xs text-muted-foreground">Pending / Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/20">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-delivered-orders">{deliveredOrders.length}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-serif text-lg font-semibold mb-4">Customer Info</h2>
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg bg-[#C9A961]/15 text-[#C9A961]">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fullName}</p>
              {customer.isAdmin && (
                <Badge className="text-[10px] bg-[#C9A961]/15 text-[#C9A961] border-0 no-default-hover-elevate no-default-active-elevate mt-0.5">
                  <Shield className="h-3 w-3 mr-1" /> Admin
                </Badge>
              )}
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm break-all" data-testid="text-customer-email">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm" data-testid="text-customer-phone">{customer.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            {customer.savedShippingAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p>{customer.savedShippingAddress.address}</p>
                  <p className="text-muted-foreground">{customer.savedShippingAddress.city}, {customer.savedShippingAddress.state} - {customer.savedShippingAddress.pincode}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-serif text-lg font-semibold mb-4">Order History ({customer.orders.length})</h2>
          {customer.orders.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.map((order) => {
                    const sc = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <TableRow key={order.id} data-testid={`row-customer-order-${order.id}`}>
                        <TableCell><span className="font-medium text-sm">#{order.id}</span></TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                          </span>
                        </TableCell>
                        <TableCell><span className="text-sm font-medium">Rs. {Number(order.totalAmount).toLocaleString("en-IN")}</span></TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate ${order.paymentStatus === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                            {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate ${sc.className}`}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)} data-testid={`button-view-customer-order-${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <EditCustomerDialog customer={customer} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
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
                  {selectedOrder.paymentStatus === "paid" ? "Paid" : "Pending"} {selectedOrder.paymentMethod ? `(${selectedOrder.paymentMethod})` : ""}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Delivery Charge</span>
                <span className="text-sm">{Number(selectedOrder.deliveryCharge) > 0 ? `Rs. ${Number(selectedOrder.deliveryCharge).toLocaleString("en-IN")}` : "Free"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-bold">Rs. {Number(selectedOrder.totalAmount).toLocaleString("en-IN")}</span>
              </div>
              <Separator />
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
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-sm font-medium mb-2">Shipping Address</p>
                  <div className="p-3 rounded-md bg-muted/30 text-sm">
                    {(() => {
                      const addr = selectedOrder.shippingAddress as any;
                      const name = addr.fullName || `${addr.firstName || ""} ${addr.lastName || ""}`.trim();
                      return (
                        <>
                          <p className="font-medium">{name}</p>
                          <p className="text-muted-foreground">{addr.address}</p>
                          <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-muted-foreground">Phone: {addr.phone}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {(selectedOrder as any).delhiveryWaybill && (
                <div>
                  <p className="text-sm font-medium mb-2">Tracking</p>
                  <div className="p-3 rounded-md bg-muted/30 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Waybill</span>
                      <span className="font-mono text-xs">{(selectedOrder as any).delhiveryWaybill}</span>
                    </div>
                    {(selectedOrder as any).trackingUrl && (
                      <a href={(selectedOrder as any).trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#C9A961] hover:underline mt-1">
                        Track on Delhivery <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}