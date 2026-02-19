import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Clock, Package, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="text-center mb-8">
        <ShieldCheck className="h-10 w-10 mx-auto text-[#C9A961] mb-3" />
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-return-policy-title">
          Return & Refund Policy
        </h1>
        <p className="text-muted-foreground text-sm">
          We want you to be completely happy with your purchase
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">2-Day Return Window</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can request a return within <strong className="text-foreground">2 days of delivery</strong>. 
                The return window is calculated from the date your order is marked as delivered. 
                Once the window closes, returns will not be accepted.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Eligible Items</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Items must be unused, unwashed, and in their original packaging with all tags intact. 
                Customized or altered items cannot be returned. Items showing signs of wear, 
                damage, or missing original packaging will not be accepted for return.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">How to Request a Return</h2>
              <ol className="text-sm text-muted-foreground leading-relaxed space-y-1.5 list-decimal pl-4">
                <li>Go to <Link href="/orders"><span className="text-[#C9A961] hover:underline cursor-pointer">My Orders</span></Link> and find the delivered order.</li>
                <li>Click the "Request Return" button on the order.</li>
                <li>Provide a reason for the return and submit your request.</li>
                <li>Our team will review your request within 24-48 hours.</li>
                <li>You will receive an email notification once your return is approved or declined.</li>
              </ol>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Refund Process</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once your return is approved, please ship the item(s) back within 3 days. 
                After we receive and inspect the returned items, your refund will be processed 
                within <strong className="text-foreground">5-7 business days</strong> to the original payment method. 
                Shipping charges are non-refundable.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Non-Returnable Items</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc pl-4">
                <li>Innerwear and undergarments</li>
                <li>Customized or tailored products</li>
                <li>Items purchased during clearance sales (unless defective)</li>
                <li>Items without original packaging or tags</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="text-center pt-4 pb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Need help with a return? Contact our support team
          </p>
          <p className="text-sm font-medium text-[#C9A961]" data-testid="text-support-email">
            support@ravindrra.com
          </p>
        </div>
      </div>
    </div>
  );
}
