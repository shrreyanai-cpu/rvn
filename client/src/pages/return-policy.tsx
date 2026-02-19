import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Clock, Video, AlertCircle, CheckCircle, XCircle, Palette, Package, FileText } from "lucide-react";
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
          Please read carefully before placing your order
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
                you are eligible for a return and refund. No other reason for return will be entertained.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Video className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Unboxing Video is Mandatory</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You <strong className="text-foreground">must record a continuous unboxing video</strong> while opening your parcel.
                The video should clearly show the sealed package being opened and the condition of the product inside.
                Without a valid unboxing video, return requests will not be accepted under any circumstances.
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
            <Palette className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">No Colour/Size Exchange or Return</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Colour preference changes are not eligible for return or exchange.</strong>{" "}
                Please check the product images and description carefully before ordering. Slight colour variations
                may occur due to screen settings and lighting in photography. Similarly, size exchanges are not available &ndash;
                please refer to our size guide before placing your order.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">No Change-of-Mind Returns</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We do not accept returns for change of mind, wrong selection, or if you simply do not like the product
                after receiving it. All sales are final unless the item is damaged or defective.
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
                <li>Record an unboxing video when you receive your parcel.</li>
                <li>If the item is damaged, go to <Link href="/orders"><span className="text-[#C9A961] hover:underline cursor-pointer">My Orders</span></Link> and click "Return" on the delivered order.</li>
                <li>Upload your unboxing/damage video (MP4, MOV, AVI).</li>
                <li>Describe the damage clearly and submit your request.</li>
                <li>Our team will review the video and respond within 24-48 hours.</li>
                <li>You will receive an email notification once your return is approved or declined.</li>
              </ol>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Refund Process</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once your return is approved after video verification, please ship the item(s) back within 3 days.
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
                <li>Items without damage (change of mind, wrong size, colour preference, etc.)</li>
                <li>Requests without a valid unboxing video showing the sealed package being opened</li>
                <li>Requests made after the 2-day return window</li>
                <li>Colour or size exchange requests</li>
                <li>Innerwear and undergarments</li>
                <li>Customized or tailored products</li>
                <li>Items that have been worn, washed, or altered</li>
                <li>Products with removed tags or damaged original packaging (by customer)</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-[#C9A961]/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Important Disclaimer</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By placing an order on Ravindrra Vastra Niketan, you acknowledge and agree to these return and refund terms.
                We strongly recommend recording an unboxing video every time you receive a delivery. This protects both you and us
                in case of any transit damage.
              </p>
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
