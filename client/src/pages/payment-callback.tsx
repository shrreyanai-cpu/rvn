import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, XCircle, Loader2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";

type PaymentResult = {
  status: "loading" | "success" | "failed" | "pending";
  orderId: string | null;
};

export default function PaymentCallbackPage() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<PaymentResult>({ status: "loading", orderId: null });

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

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        {result.status === "loading" && (
          <div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#C9A961] mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2" data-testid="text-payment-verifying">
              Verifying Payment
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {result.status === "success" && (
          <div>
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2" data-testid="text-payment-success">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your order #{result.orderId} has been placed successfully. We'll start processing it right away.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/orders">
                <Button className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-view-orders">
                  View My Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
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

        {result.status === "failed" && (
          <div>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2" data-testid="text-payment-failed">
              Payment Failed
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {result.orderId
                ? `Your payment for order #${result.orderId} could not be completed. Please try again.`
                : "Something went wrong with your payment. Please try again."}
            </p>
            <div className="flex flex-col gap-3">
              {result.orderId && (
                <Link href="/orders">
                  <Button className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-retry-orders">
                    View Orders
                  </Button>
                </Link>
              )}
              <Link href="/shop">
                <Button variant="outline" className="w-full" data-testid="button-back-shop">
                  Back to Shop
                </Button>
              </Link>
            </div>
          </div>
        )}

        {result.status === "pending" && (
          <div>
            <Clock className="h-14 w-14 text-yellow-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2" data-testid="text-payment-pending">
              Payment Pending
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your payment for order #{result.orderId} is being processed. We'll update the status shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/orders">
                <Button className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-check-orders">
                  Check Order Status
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full" data-testid="button-continue-shopping-pending">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
