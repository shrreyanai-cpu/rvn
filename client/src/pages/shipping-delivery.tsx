import { Link } from "wouter";
import { ArrowLeft, Truck, MapPin, Clock, IndianRupee, Package, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ShippingDeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="text-center mb-8">
        <Truck className="h-10 w-10 mx-auto text-[#C9A961] mb-3" />
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-shipping-title">
          Shipping & Delivery
        </h1>
        <p className="text-muted-foreground text-sm">
          Everything you need to know about our shipping and delivery process
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <IndianRupee className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Shipping Charges</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li><strong className="text-foreground">Free Shipping:</strong> On all orders above Rs. 1,500.</li>
                <li><strong className="text-foreground">Flat Rate:</strong> Rs. 80 for orders below Rs. 1,500.</li>
                <li>Use coupon code <strong className="text-foreground">FREESHIP</strong> to get free shipping on any order.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Delivery Partner</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use <strong className="text-foreground">Delhivery</strong> as our trusted courier partner for all shipments across India.
                Delhivery is one of India's leading logistics companies, ensuring safe and timely delivery of your orders
                with real-time tracking capabilities.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Estimated Delivery Time</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li><strong className="text-foreground">Metro Cities:</strong> 3-5 business days (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad).</li>
                <li><strong className="text-foreground">Tier 2 Cities:</strong> 5-7 business days.</li>
                <li><strong className="text-foreground">Other Areas:</strong> 7-10 business days depending on location and accessibility.</li>
                <li>Delivery times are estimates and may vary due to unforeseen circumstances, festivals, or weather conditions.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Pincode Serviceability</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We deliver across India. You can check if delivery is available to your pincode during checkout.
                If your pincode is not serviceable, please contact our support team and we will try to arrange an alternative delivery method.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Order Tracking</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>Once your order is shipped, you will receive an email with the tracking details and waybill number.</li>
                <li>You can track your order status from the <Link href="/orders"><span className="text-[#C9A961] hover:underline cursor-pointer">My Orders</span></Link> page.</li>
                <li>Real-time tracking is available through the Delhivery tracking link provided with your shipment.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Packaging</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All products are carefully packaged to prevent damage during transit. Premium garments are wrapped in
                tissue paper and placed in branded packaging to ensure they reach you in perfect condition.
                We recommend recording an unboxing video as per our return policy requirements.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-1">Need Help?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have any questions about shipping or need assistance with your delivery, please reach out to us
                at <a href="mailto:support@ravindrra.com" className="text-[#C9A961] hover:underline">support@ravindrra.com</a> or
                call us at <a href="tel:+918889777992" className="text-[#C9A961] hover:underline">+91 88897 77992</a>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
