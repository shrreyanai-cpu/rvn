import { Link } from "wouter";
import { ArrowLeft, FileText, ShieldCheck, CreditCard, Package, AlertTriangle, Scale, Video, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TermsConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="text-center mb-8">
        <FileText className="h-10 w-10 mx-auto text-[#C9A961] mb-3" />
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-terms-title">
          Terms & Conditions
        </h1>
        <p className="text-muted-foreground text-sm">
          Last updated: February 2026
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">General Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing and using the Ravindrra Vastra Niketan website, you agree to be bound by these Terms & Conditions.
                These terms apply to all visitors, users, and customers of the website. If you do not agree with any part of these terms,
                please do not use our website or services.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Products & Orders</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>All product images are for illustration purposes. Actual colours may vary slightly due to screen settings and lighting conditions during photography.</li>
                <li>We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion, including orders that appear to be placed by dealers, resellers, or distributors.</li>
                <li>Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated.</li>
                <li>Product availability is subject to change without prior notice.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Payment Terms</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>All payments are processed securely through Cashfree Payment Gateway. We do not store your card or bank details.</li>
                <li>Orders are confirmed only after successful payment verification. Failed or pending payments will not result in order fulfilment.</li>
                <li>In case of payment failure, the amount (if debited) will be refunded to your original payment method within 5-7 business days.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Video className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Mandatory Unboxing Video</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customers are <strong className="text-foreground">required to record a continuous unboxing video</strong> while opening their parcel.
                This video is mandatory for filing any return or damage claim. Without a valid unboxing video, no return requests
                will be entertained. The video must clearly show the sealed package being opened and the condition of the product.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Ban className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">No Colour or Size Exchange</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>We do <strong className="text-foreground">not accept returns or exchanges for colour preference, size issues, or change of mind</strong>.</li>
                <li>Returns are accepted <strong className="text-foreground">only for damaged or defective items</strong> within 2 days of delivery.</li>
                <li>Please refer to our <Link href="/return-policy"><span className="text-[#C9A961] hover:underline cursor-pointer">Return Policy</span></Link> for complete details.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Intellectual Property</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All content on this website including text, images, logos, product designs, and graphics are the property of
                Ravindrra Vastra Niketan and are protected under applicable copyright and intellectual property laws.
                Unauthorised use, reproduction, or distribution of any content is strictly prohibited.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Limitation of Liability</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>Ravindrra Vastra Niketan shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</li>
                <li>We are not responsible for delays caused by courier services, natural disasters, or other circumstances beyond our control.</li>
                <li>Our liability is limited to the purchase price of the product in question.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Governing Law</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India.
                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center mt-8 text-xs text-muted-foreground">
        For any queries regarding these terms, please contact us at{" "}
        <a href="mailto:support@ravindrra.com" className="text-[#C9A961] hover:underline">support@ravindrra.com</a>
      </div>
    </div>
  );
}
