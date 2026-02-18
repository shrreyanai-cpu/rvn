import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, XCircle, Loader2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type PaymentResult = {
  status: "loading" | "success" | "failed" | "pending";
  orderId: string | null;
};

export default function PaymentCallbackPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [result, setResult] = useState<PaymentResult>({ status: "loading", orderId: null });
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const { data: savedAddressData } = useQuery<{ savedAddress: any }>({
    queryKey: ["/api/user/saved-address"],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    const cfOrderId = params.get("cf_order_id");

    if (!orderId || !cfOrderId) {
      setResult({ status: "failed", orderId: null });
      return;
    }

    async function verifyPayment() {
      try {
        const res = await apiRequest("POST", "/api/payments/verify", { orderId, cfOrderId });
        const data = await res.json();

        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

        if (data.paymentStatus === "paid") {
          setResult({ status: "success", orderId });
        } else if (data.paymentStatus === "failed") {
          setResult({ status: "failed", orderId });
        } else {
          setResult({ status: "pending", orderId });
        }
      } catch {
        setResult({ status: "failed", orderId });
      }
    }

    verifyPayment();
  }, []);

  useEffect(() => {
    if (result.status === "success" && savedAddressData && !savedAddressData.savedAddress) {
      setShowSavePrompt(true);
    }
  }, [result.status, savedAddressData]);

  async function saveShippingAddress() {
    try {
      const orderId = result.orderId;
      if (!orderId) return;
      const orderRes = await fetch(`/api/orders`, { credentials: "include" });
      const orders = await orderRes.json();
      const order = orders.find((o: any) => o.id === Number(orderId));
      if (order?.shippingAddress) {
        await apiRequest("POST", "/api/user/saved-address", order.shippingAddress);
        queryClient.invalidateQueries({ queryKey: ["/api/user/saved-address"] });
        toast({ title: "Address saved", description: "Your shipping info will be auto-filled next time." });
      }
    } catch {
    }
    setShowSavePrompt(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="p-6 max-w-sm mx-4">
            <h3 className="font-semibold mb-2">Save your shipping info?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We can save your address so it's auto-filled next time you order. Would you like that?
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                onClick={saveShippingAddress}
                data-testid="button-save-address-yes"
              >
                Yes, Save
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSavePrompt(false)}
                data-testid="button-save-address-no"
              >
                No Thanks
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="max-w-md w-full p-8 text-center">
        {result.status === "loading" && (
          <div data-testid="payment-loading">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#C9A961] mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground text-sm">Please wait while we confirm your payment...</p>
          </div>
        )}

        {result.status === "success" && (
          <div data-testid="payment-success">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">Payment Successful</h2>
            <p className="text-muted-foreground text-sm mb-1">
              Your order #{result.orderId} has been confirmed.
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Thank you for shopping with Ravindrra Vastra Niketan!
            </p>
            <Link href="/orders">
              <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-view-orders">
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {result.status === "failed" && (
          <div data-testid="payment-failed">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {result.orderId
                ? `Payment for order #${result.orderId} could not be completed. Please try again.`
                : "Something went wrong with the payment process."}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/orders">
                <Button className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-view-orders-failed">
                  View My Orders
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}

        {result.status === "pending" && (
          <div data-testid="payment-pending">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">Payment Processing</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your payment for order #{result.orderId} is being processed. We will update you once confirmed.
            </p>
            <Link href="/orders">
              <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-view-orders-pending">
                View My Orders
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
