import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Package, Truck, Check, Clock, MapPin, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { Order, OrderItem } from "@shared/schema";

interface TrackingResponse extends Order {
  delhiveryTracking?: {
    Status: string;
    StatusText?: string;
    ScannedTime?: string;
    CurrentLocation?: string;
    Scans?: Array<{
      Location: string;
      Status: string;
      StatusText: string;
      Timestamp: string;
    }>;
  };
}

const statusConfig: Record<string, { label: string; icon: typeof Package; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", icon: Clock, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", icon: Check, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  returned: { label: "Returned", icon: Package, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

const timelineStages = [
  { id: 1, label: "Order Placed", icon: Package },
  { id: 2, label: "Processing", icon: Clock },
  { id: 3, label: "Shipped", icon: Truck },
  { id: 4, label: "Out for Delivery", icon: MapPin },
  { id: 5, label: "Delivered", icon: Check },
];

function getTimelineProgress(status: string): number {
  const statusMap: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    shipped: 3,
    cancelled: 0,
    returned: 5,
    delivered: 5,
  };
  return statusMap[status] || 1;
}

function Timeline({ status }: { status: string }) {
  const progress = getTimelineProgress(status);

  return (
    <div className="py-6">
      <div className="flex justify-between items-center gap-2">
        {timelineStages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index + 1 <= progress;
          const isCurrent = index + 1 === progress;

          return (
            <div key={stage.id} className="flex flex-col items-center flex-1">
              <div className="relative flex flex-col items-center w-full">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-[#C9A961] text-[#1A1A1A]"
                      : "bg-muted text-muted-foreground border-2 border-muted"
                  } ${isCurrent ? "ring-2 ring-[#C9A961] ring-offset-2" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < timelineStages.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-[calc(100%-3rem)] h-1 transition-all ${
                      isCompleted ? "bg-[#C9A961]" : "bg-muted"
                    }`}
                    style={{ marginTop: 0 }}
                  />
                )}
              </div>
              <p className="text-xs font-medium text-center mt-2 px-1 h-8 flex items-center justify-center">
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const trackMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("GET", `/api/track-order/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Order not found");
        throw new Error("Failed to fetch order");
      }
      return res.json();
    },
    onSuccess: (data: TrackingResponse) => {
      setTrackingData(data);
      setSearchAttempted(true);
    },
    onError: () => {
      setTrackingData(null);
      setSearchAttempted(true);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      trackMutation.mutate(orderId.trim());
    }
  };

  const statusInfo = trackingData ? statusConfig[trackingData.status] || statusConfig.pending : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-home">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2" data-testid="text-page-title">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Enter your Order ID to see the status of your shipment
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 sm:p-8 mb-8" data-testid="card-search-form">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="order-id" className="block text-sm font-medium mb-2">
                Order ID
              </label>
              <div className="flex gap-2">
                <Input
                  id="order-id"
                  type="number"
                  placeholder="Enter your Order ID (e.g., 1234)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  disabled={trackMutation.isPending}
                  data-testid="input-order-id"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!orderId.trim() || trackMutation.isPending}
                  data-testid="button-search"
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
                >
                  {trackMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Track Order"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Error State */}
        {searchAttempted && trackMutation.isError && (
          <Card className="p-6 sm:p-8 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 mb-8" data-testid="card-error">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">Order Not Found</h3>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  We couldn't find an order with ID "<span className="font-mono font-semibold">{orderId}</span>". 
                  Please check the Order ID and try again.
                </p>
                <p className="text-red-600 dark:text-red-500 text-xs mt-2">
                  You can find your Order ID in the confirmation email we sent you after your purchase.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card className="p-6 sm:p-8" data-testid={`card-order-details-${trackingData.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h2 className="font-serif text-2xl font-bold">Order #{trackingData.id}</h2>
                    {StatusIcon && (
                      <Badge
                        className={`text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate ${statusInfo?.color}`}
                        data-testid={`badge-status-${trackingData.id}`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo?.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ordered on {new Date(trackingData.createdAt!).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-serif text-2xl font-bold text-[#C9A961]" data-testid={`text-total-${trackingData.id}`}>
                    Rs. {Number(trackingData.totalAmount).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Payment Status */}
              {trackingData.paymentStatus && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Payment Status</p>
                  <Badge
                    className={`text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate ${
                      trackingData.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : trackingData.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                    data-testid={`badge-payment-${trackingData.id}`}
                  >
                    {trackingData.paymentStatus === "paid"
                      ? "Payment Confirmed"
                      : trackingData.paymentStatus === "failed"
                        ? "Payment Failed"
                        : "Payment Pending"}
                  </Badge>
                </div>
              )}
            </Card>

            {/* Timeline */}
            <Card className="p-6 sm:p-8" data-testid={`card-timeline-${trackingData.id}`}>
              <h3 className="font-serif text-lg font-semibold mb-4">Delivery Progress</h3>
              <Timeline status={trackingData.status} />
            </Card>

            {/* Items */}
            <Card className="p-6 sm:p-8" data-testid={`card-items-${trackingData.id}`}>
              <h3 className="font-serif text-lg font-semibold mb-4">Items in this Order</h3>
              <div className="space-y-4">
                {(trackingData.items as OrderItem[])?.length > 0 ? (
                  (trackingData.items as OrderItem[]).map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b" data-testid={`item-${trackingData.id}-${index}`}>
                      {item.imageUrl && (
                        <div className="w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate" data-testid={`item-name-${index}`}>
                          {item.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Quantity: <span className="font-semibold">{item.quantity}</span>
                        </p>
                        {item.size && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Size: <span className="font-semibold">{item.size}</span>
                          </p>
                        )}
                        {item.color && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Color: <span className="font-semibold">{item.color}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm sm:text-base" data-testid={`item-price-${index}`}>
                          Rs. {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No items found in this order.</p>
                )}
              </div>
            </Card>

            {/* Shipping & Tracking */}
            {(trackingData.delhiveryWaybill || trackingData.trackingUrl) && (
              <Card className="p-6 sm:p-8" data-testid={`card-shipping-${trackingData.id}`}>
                <h3 className="font-serif text-lg font-semibold mb-4">Shipping & Tracking</h3>
                <div className="space-y-4">
                  {trackingData.delhiveryWaybill && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Delhivery Waybill Number</p>
                      <p className="font-mono font-semibold text-sm" data-testid={`text-waybill-${trackingData.id}`}>
                        {trackingData.delhiveryWaybill}
                      </p>
                    </div>
                  )}
                  {trackingData.trackingUrl && (
                    <a
                      href={trackingData.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-delhivery-${trackingData.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Track on Delhivery <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Delhivery Tracking Details */}
            {trackingData.delhiveryTracking && (
              <Card className="p-6 sm:p-8" data-testid={`card-delhivery-${trackingData.id}`}>
                <h3 className="font-serif text-lg font-semibold mb-4">Tracking Updates</h3>
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="p-4 rounded-md bg-[#2C3E50]/5 dark:bg-[#C9A961]/10 border border-[#2C3E50]/10 dark:border-[#C9A961]/20">
                    <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                    <p className="font-semibold text-sm mb-1" data-testid={`text-delhivery-status-${trackingData.id}`}>
                      {trackingData.delhiveryTracking.StatusText || trackingData.delhiveryTracking.Status}
                    </p>
                    {trackingData.delhiveryTracking.ScannedTime && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(trackingData.delhiveryTracking.ScannedTime).toLocaleString("en-IN")}
                      </p>
                    )}
                    {trackingData.delhiveryTracking.CurrentLocation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {trackingData.delhiveryTracking.CurrentLocation}
                      </p>
                    )}
                  </div>

                  {/* Scan History */}
                  {trackingData.delhiveryTracking.Scans && trackingData.delhiveryTracking.Scans.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Scan History</p>
                      <div className="space-y-2">
                        {trackingData.delhiveryTracking.Scans.map((scan, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-md bg-muted/50 text-sm"
                            data-testid={`scan-${trackingData.id}-${index}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-xs sm:text-sm">{scan.StatusText || scan.Status}</p>
                                <p className="text-xs text-muted-foreground">{scan.Location}</p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                {new Date(scan.Timestamp).toLocaleString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!trackingData && !searchAttempted && (
          <Card className="p-12 text-center" data-testid="card-empty-state">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-serif text-lg font-semibold mb-2">Ready to track your order?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Enter your Order ID above to see real-time tracking updates and delivery status.
            </p>
            <p className="text-xs text-muted-foreground">
              Your Order ID can be found in your confirmation email.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
