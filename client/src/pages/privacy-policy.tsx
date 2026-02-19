import { Link } from "wouter";
import { ArrowLeft, Lock, Eye, Database, Shield, Globe, UserCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="text-center mb-8">
        <Lock className="h-10 w-10 mx-auto text-[#C9A961] mb-3" />
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-privacy-title">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm">
          Last updated: February 2026
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Information We Collect</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, and shipping address provided during account registration and checkout.</li>
                <li><strong className="text-foreground">Payment Information:</strong> Payment details are processed securely through Cashfree Payment Gateway. We do not store your card numbers or banking credentials on our servers.</li>
                <li><strong className="text-foreground">Order Information:</strong> Purchase history, order details, and delivery preferences to provide you with a better shopping experience.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">How We Use Your Information</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>To process and fulfil your orders, including shipping and delivery through our courier partner Delhivery.</li>
                <li>To send order confirmations, shipping updates, and delivery notifications via email.</li>
                <li>To communicate about promotional offers and new arrivals (you can opt out at any time).</li>
                <li>To verify your identity through email OTP during account registration.</li>
                <li>To improve our website, products, and customer service.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Data Security</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>Your passwords are securely hashed and never stored in plain text.</li>
                <li>All payment transactions are encrypted and processed through certified payment gateways.</li>
                <li>We implement industry-standard security measures to protect your personal data from unauthorised access.</li>
                <li>Unboxing videos uploaded for return claims are stored securely and accessible only to authorised admin personnel.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Third-Party Sharing</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li><strong className="text-foreground">Delivery Partner:</strong> Your name, phone number, and shipping address are shared with Delhivery for order delivery purposes only.</li>
                <li><strong className="text-foreground">Payment Gateway:</strong> Payment information is shared with Cashfree for secure transaction processing.</li>
                <li><strong className="text-foreground">Email Service:</strong> Your email address is used with our email service provider to send transactional and promotional communications.</li>
                <li>We do not sell, trade, or rent your personal information to any third parties for marketing purposes.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Your Rights</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>You can access and update your personal information through your account profile at any time.</li>
                <li>You can request deletion of your account by contacting our support team.</li>
                <li>You can opt out of promotional emails by using the unsubscribe link in our emails or contacting support.</li>
                <li>You have the right to request a copy of all personal data we hold about you.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Cookies & Analytics</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your session and shopping cart. We may use analytics tools to understand
                how visitors interact with our website, helping us improve your shopping experience. No personal data is shared
                with analytics providers without your consent.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center mt-8 text-xs text-muted-foreground">
        For privacy-related queries, please contact us at{" "}
        <a href="mailto:support@ravindrra.com" className="text-[#C9A961] hover:underline">support@ravindrra.com</a>
      </div>
    </div>
  );
}
