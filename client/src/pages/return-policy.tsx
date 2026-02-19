import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Clock, Camera, AlertCircle, CheckCircle, XCircle } from "lucide-react";
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
          We stand behind the quality of our products
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Damaged Items Only</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Returns are <strong className="text-foreground">only accepted for damaged or defective items</strong>. 
                If you receive a product that is torn, stained, has manufacturing defects, or is damaged during transit, 
                you are eligible for a return and refund.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">2-Day Return Window</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You must report the damage within <strong className="text-foreground">2 days of delivery</strong>. 
                The return window is calculated from the date your order is marked as delivered. 
                Once the window closes, returns will not be accepted.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Camera className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Photo Proof Required</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You must upload a <strong className="text-foreground">clear photograph of the damaged area</strong> when 
                submitting your return request. The photo should clearly show the defect or damage. 
                Requests without a valid damage photo will not be processed.
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
                <li>Click the "Return" button on the order.</li>
                <li>Upload a clear photo of the damaged item.</li>
                <li>Describe the damage and submit your request.</li>
                <li>Our team will verify the damage photo and respond within 24-48 hours.</li>
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
                Once your return is approved after damage verification, please ship the item(s) back within 3 days. 
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
              <h2 className="font-semibold mb-1">Non-Returnable Cases</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc pl-4">
                <li>Items without damage (change of mind, wrong size, etc.)</li>
                <li>Requests without a clear damage photo</li>
                <li>Requests made after the 2-day return window</li>
                <li>Innerwear and undergarments</li>
                <li>Customized or tailored products</li>
                <li>Items that have been worn, washed, or altered</li>
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
