import { Link, useLocation } from "wouter";
import { Package, ArrowLeft, Clock, Truck, CheckCircle, ShoppingBag, XCircle, CreditCard, Loader2, ExternalLink, RefreshCw, RotateCcw, Upload, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem } from "@shared/schema";

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", icon: Package, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  returned: { label: "Returned", icon: RotateCcw, className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

const RETURN_WINDOW_DAYS = 2;

function canRequestReturn(order: Order): boolean {
  if (order.status !== "delivered") return false;
  const deliveredAt = (order as any).updatedAt || order.createdAt;
  if (!deliveredAt) return false;
  const daysSince = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= RETURN_WINDOW_DAYS;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [returnOrderId, setReturnOrderId] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [damageImageUrl, setDamageImageUrl] = useState("");
  const [damageImagePreview, setDamageImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [returnStatuses, setReturnStatuses] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      setReorderingId(orderId);
      const res = await apiRequest("POST", `/api/orders/${orderId}/reorder`);
      return res.json();
    },
    onSuccess: (data: any) => {
      setReorderingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Items added to cart", description: `${data.addedCount || 0} item(s) added to your cart` });
      navigate("/cart");
    },
    onError: () => {
      setReorderingId(null);
      toast({ title: "Error", description: "Could not reorder. Some items may no longer be available.", variant: "destructive" });
    },
  });

  const handleDamageImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setDamageImagePreview(preview);

      const urlRes = await apiRequest("POST", "/api/uploads/request-url", {
        name: file.name,
        size: file.size,
        contentType: file.type,
      });
      const { uploadURL, objectPath } = await urlRes.json();

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setDamageImageUrl(objectPath);
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the image. Please try again.", variant: "destructive" });
      setDamageImagePreview("");
      setDamageImageUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const returnMutation = useMutation({
    mutationFn: async ({ orderId, reason, damageImageUrl }: { orderId: number; reason: string; damageImageUrl: string }) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/return`, { reason, damageImageUrl });
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setReturnStatuses(prev => ({ ...prev, [vars.orderId]: "pending" }));
      setReturnOrderId(null);
      setReturnReason("");
      setDamageImageUrl("");
      setDamageImagePreview("");
      toast({ title: "Return requested", description: "We'll review the damage photo and notify you via email." });
    },
    onError: (err: any) => {
      toast({ title: "Cannot request return", description: err?.message || "Failed to submit return request", variant: "destructive" });
    },
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
                      {(order as any).paymentStatus && (
                        <Badge
                          className={`text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate ${
                            (order as any).paymentStatus === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : (order as any).paymentStatus === "failed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          {(order as any).paymentStatus === "paid" ? "Paid" : (order as any).paymentStatus === "failed" ? "Payment Failed" : "Payment Pending"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Placed on {new Date(order.createdAt!).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                      Rs. {Number(order.totalAmount).toLocaleString("en-IN")}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reorderingId === order.id}
                      onClick={() => reorderMutation.mutate(order.id)}
                      data-testid={`button-reorder-${order.id}`}
                    >
                      {reorderingId === order.id ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Reorder
                    </Button>
                    {canRequestReturn(order) && !returnStatuses[order.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setReturnOrderId(order.id); setReturnReason(""); }}
                        data-testid={`button-return-${order.id}`}
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Return
                      </Button>
                    )}
                    {(returnStatuses[order.id] || order.status === "returned") && (
                      <Badge className="text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        <RotateCcw className="mr-1 h-3 w-3" />
                        {order.status === "returned" ? "Returned" : "Return Requested"}
                      </Badge>
                    )}
                  </div>
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

                {(order as any).trackingUrl && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#C9A961]" />
                    <span className="text-sm text-muted-foreground">
                      {(order as any).delhiveryStatus || "Shipped"}
                    </span>
                    <a
                      href={(order as any).trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-sm text-[#C9A961] hover:underline"
                      data-testid={`link-track-order-${order.id}`}
                    >
                      Track Order <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={returnOrderId !== null} onOpenChange={(open) => {
        if (!open) {
          setReturnOrderId(null);
          setReturnReason("");
          setDamageImageUrl("");
          setDamageImagePreview("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return - Damaged Item</DialogTitle>
            <DialogDescription>
              Order #{returnOrderId} &bull; Upload a photo of the damage to proceed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Photo of damaged item *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDamageImageUpload(file);
                }}
                data-testid="input-damage-image"
              />
              {damageImagePreview ? (
                <div className="mt-2 relative">
                  <img
                    src={damageImagePreview}
                    alt="Damage photo"
                    className="w-full max-h-48 object-contain rounded-md border bg-muted"
                    data-testid="img-damage-preview"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-md">
                      <Loader2 className="h-6 w-6 animate-spin text-[#C9A961]" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    data-testid="button-change-damage-image"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Change Photo
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full border-2 border-dashed rounded-md p-6 flex flex-col items-center gap-2 hover-elevate transition-colors cursor-pointer"
                  disabled={isUploading}
                  data-testid="button-upload-damage-image"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isUploading ? "Uploading..." : "Click to upload damage photo"}
                  </span>
                  <span className="text-xs text-muted-foreground">JPG, PNG supported</span>
                </button>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="return-reason">Describe the damage *</label>
              <Textarea
                id="return-reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please describe what is damaged..."
                className="mt-1"
                data-testid="input-return-reason"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Returns are only accepted for damaged items. Our team will review the photo before processing.{" "}
              <Link href="/return-policy">
                <span className="text-[#C9A961] hover:underline cursor-pointer">View return policy</span>
              </Link>
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReturnOrderId(null)} data-testid="button-cancel-return">
              Cancel
            </Button>
            <Button
              disabled={returnReason.trim().length < 5 || !damageImageUrl || isUploading || returnMutation.isPending}
              onClick={() => {
                if (returnOrderId && damageImageUrl) {
                  returnMutation.mutate({ orderId: returnOrderId, reason: returnReason.trim(), damageImageUrl });
                }
              }}
              data-testid="button-submit-return"
            >
              {returnMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Submit Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
