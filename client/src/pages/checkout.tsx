import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Loader2, CreditCard, Shield, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

declare global {
  interface Window {
    Cashfree: any;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve();
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const urlParams = new URLSearchParams(window.location.search);
  const isBuyNow = urlParams.get("buyNow") === "true";
  const buyNowProductId = urlParams.get("productId");
  const buyNowQuantity = Number(urlParams.get("quantity") || "1");
  const buyNowSize = urlParams.get("size") || undefined;
  const buyNowColor = urlParams.get("color") || undefined;

  const { data: savedAddressData } = useQuery<{ savedAddress: any }>({
    queryKey: ["/api/user/saved-address"],
  });

  useEffect(() => {
    if (savedAddressData?.savedAddress && !addressLoaded) {
      const addr = savedAddressData.savedAddress;
      setForm({
        fullName: addr.fullName || "",
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
        phone: addr.phone || "",
      });
      setAddressLoaded(true);
    }
  }, [savedAddressData, addressLoaded]);

  const { data: buyNowProduct, isLoading: buyNowLoading, isError: buyNowError } = useQuery<Product>({
    queryKey: [`/api/products/by-id/${buyNowProductId}`],
    enabled: isBuyNow && !!buyNowProductId,
  });

  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !isBuyNow,
  });

  const displayItems = isBuyNow && buyNowProduct
    ? [{ product: buyNowProduct, quantity: buyNowQuantity }]
    : cartItems || [];

  const subtotal = displayItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal > 2999 ? 0 : 199;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await apiRequest("POST", "/api/coupons/apply", {
        code: couponCode.trim(),
        subtotal,
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discount: data.discount });
        setCouponCode("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch {
      setCouponError("Could not apply coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  async function handlePaymentRedirect(data: any) {
    setPaymentLoading(true);
    try {
      await loadCashfreeScript();
      const cashfreeMode = import.meta.env.VITE_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox";
      const cashfree = window.Cashfree({ mode: cashfreeMode });
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        returnUrl: `${window.location.origin}/payment/callback?order_id=${data.id}&cf_order_id=${data.cashfreeOrderId}`,
      });
    } catch (err) {
      console.error("Cashfree checkout error:", err);
      setPaymentLoading(false);
      toast({
        title: "Payment Error",
        description: "Could not open payment page. Your order has been saved.",
        variant: "destructive",
      });
      navigate("/orders");
    }
  }

  const buyNowMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders/buy-now", {
        productId: Number(buyNowProductId),
        quantity: buyNowQuantity,
        size: buyNowSize || null,
        color: buyNowColor || null,
        shippingAddress: form,
        couponCode: appliedCoupon?.code || null,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      if (data.paymentSessionId) {
        await handlePaymentRedirect(data);
      } else {
        toast({
          title: "Order placed!",
          description: `Order #${data.id} created. Payment could not be initiated.`,
          variant: "destructive",
        });
        navigate("/orders");
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Could not place order. Please try again.", variant: "destructive" });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        shippingAddress: form,
        couponCode: appliedCoupon?.code || null,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      if (data.paymentSessionId) {
        await handlePaymentRedirect(data);
      } else {
        toast({
          title: "Order placed!",
          description: `Order #${data.id} created. Payment could not be initiated, please contact support.`,
          variant: "destructive",
        });
        navigate("/orders");
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Could not place order. Please try again.", variant: "destructive" });
    },
  });

  const isFormValid =
    form.fullName &&
    form.address &&
    form.city &&
    form.state &&
    form.pincode.length >= 5 &&
    /^\d+$/.test(form.pincode) &&
    form.phone.length >= 10 &&
    /^\d+$/.test(form.phone);

  const isProcessing = placeOrderMutation.isPending || buyNowMutation.isPending || paymentLoading;

  if (!isBuyNow && isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!isBuyNow && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/shop">
          <Button data-testid="button-go-shopping">Go Shopping</Button>
        </Link>
      </div>
    );
  }

  if (isBuyNow && buyNowLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (isBuyNow && (buyNowError || !buyNowProduct)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Link href="/shop">
          <Button data-testid="button-back-shop">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href={isBuyNow ? "/shop" : "/cart"}>
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-cart">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {isBuyNow ? "Back to Shop" : "Back to Cart"}
        </Button>
      </Link>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6" data-testid="text-checkout-title">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  data-testid="input-full-name"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address"
                  data-testid="input-address"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  data-testid="input-city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={form.state}
                  onValueChange={(value) => setForm({ ...form, state: value })}
                >
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state} data-testid={`option-state-${state}`}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  type="tel"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm({ ...form, pincode: val });
                  }}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  data-testid="input-pincode"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm({ ...form, phone: val });
                  }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  data-testid="input-phone"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Coupon Code
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    {appliedCoupon.code} applied
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    You save Rs. {appliedCoupon.discount.toLocaleString("en-IN")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeCoupon}
                  data-testid="button-remove-coupon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    placeholder="Enter coupon code"
                    data-testid="input-coupon-code"
                  />
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    data-testid="button-apply-coupon"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-2" data-testid="text-coupon-error">{couponError}</p>
                )}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {displayItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.product.images?.[0] || "/images/products/silk-saree-burgundy.png"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium flex-shrink-0">
                    Rs. {(Number(item.product.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs. {subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : `Rs. ${shipping}`}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>- Rs. {appliedCoupon.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>Rs. {total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-muted/50 flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Secure payment powered by Cashfree. Supports UPI, Cards, Net Banking & Wallets.
              </p>
            </div>

            <Button
              className="w-full mt-4 bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
              disabled={!isFormValid || isProcessing}
              onClick={() => {
                if (isBuyNow) {
                  buyNowMutation.mutate();
                } else {
                  placeOrderMutation.mutate();
                }
              }}
              data-testid="button-place-order"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {paymentLoading ? "Redirecting to Payment..." : "Processing..."}
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Rs. {total.toLocaleString("en-IN")}
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
