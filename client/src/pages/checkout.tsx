import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Loader2, CreditCard, Shield, Tag, X, MapPin, Plus, Check, Truck, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product, Address } from "@shared/schema";

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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; discountType?: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [pincodeCheckResult, setPincodeCheckResult] = useState<{ serviceable: boolean; checked: boolean; loading: boolean; pincode: string } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    label: "Home",
  });

  const urlParams = new URLSearchParams(window.location.search);
  const isBuyNow = urlParams.get("buyNow") === "true";
  const buyNowProductId = urlParams.get("productId");
  const buyNowQuantity = Number(urlParams.get("quantity") || "1");
  const buyNowSize = urlParams.get("size") || undefined;
  const buyNowColor = urlParams.get("color") || undefined;

  const { data: savedAddresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/user/addresses"],
  });

  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && selectedAddressId === null && !showNewAddressForm) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
    if (savedAddresses && savedAddresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses]);

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
  const shipping = subtotal >= 1000 ? 0 : 80;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const checkPincodeServiceability = useCallback(async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeCheckResult(null);
      return;
    }
    setPincodeCheckResult({ serviceable: false, checked: false, loading: true, pincode });
    try {
      const res = await apiRequest("POST", "/api/delhivery/check-pincode", { pincode });
      const data = await res.json();
      setPincodeCheckResult({ serviceable: data.serviceable, checked: true, loading: false, pincode });
    } catch {
      setPincodeCheckResult({ serviceable: false, checked: true, loading: false, pincode });
    }
  }, []);

  useEffect(() => {
    const addr = getSelectedAddress();
    if (addr?.pincode && addr.pincode.length === 6) {
      if (!pincodeCheckResult || pincodeCheckResult.pincode !== addr.pincode) {
        checkPincodeServiceability(addr.pincode);
      }
    }
  }, [selectedAddressId, form.pincode]);

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
        setAppliedCoupon({ code: data.code, discount: data.discount, discountType: data.discountType });
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

  function getSelectedAddress() {
    if (showNewAddressForm) {
      return form;
    }
    const addr = savedAddresses?.find(a => a.id === selectedAddressId);
    if (addr) {
      return {
        fullName: addr.fullName,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        phone: addr.phone,
      };
    }
    return null;
  }

  async function autoSaveNewAddress() {
    if (showNewAddressForm && form.fullName && form.address && form.city && form.state && form.pincode && form.phone) {
      try {
        await apiRequest("POST", "/api/user/addresses", {
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          phone: form.phone,
          label: form.label || "Home",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      } catch {}
    }
  }

  async function handlePaymentRedirect(data: any) {
    if (!data.paymentSessionId) return;
    setPaymentLoading(true);
    try {
      await loadCashfreeScript();
      const cashfree = window.Cashfree({ mode: "production" });
      await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
    } catch {
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
      const addr = getSelectedAddress();
      if (!addr) throw new Error("No address selected");
      await autoSaveNewAddress();
      const res = await apiRequest("POST", "/api/orders/buy-now", {
        productId: Number(buyNowProductId),
        quantity: buyNowQuantity,
        size: buyNowSize || null,
        color: buyNowColor || null,
        shippingAddress: addr,
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
      const addr = getSelectedAddress();
      if (!addr) throw new Error("No address selected");
      await autoSaveNewAddress();
      const res = await apiRequest("POST", "/api/orders", {
        shippingAddress: addr,
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

  const isProcessing = buyNowMutation.isPending || placeOrderMutation.isPending || paymentLoading;

  const isFormValid = termsAccepted && (showNewAddressForm
    ? form.fullName && form.address && form.city && form.state && form.pincode.length === 6 && form.phone.length === 10
    : selectedAddressId !== null);

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h2>
              {savedAddresses && savedAddresses.length > 0 && (
                <Link href="/profile">
                  <Button variant="ghost" size="sm" data-testid="button-manage-addresses">
                    Manage Addresses
                  </Button>
                </Link>
              )}
            </div>

            {addressesLoading ? (
              <div className="py-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : savedAddresses && savedAddresses.length > 0 && !showNewAddressForm ? (
              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-md border cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-[#C9A961] bg-[#C9A961]/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid={`address-card-${addr.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{addr.fullName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {addr.label || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A961]/20 text-[#C9A961]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground">{addr.phone}</p>
                      </div>
                      {selectedAddressId === addr.id && (
                        <Check className="h-5 w-5 text-[#C9A961] flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowNewAddressForm(true);
                    setSelectedAddressId(null);
                    setForm({ fullName: "", address: "", city: "", state: "", pincode: "", phone: "", label: "Home" });
                  }}
                  data-testid="button-add-new-address"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAddresses && savedAddresses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewAddressForm(false);
                      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                      setSelectedAddressId(defaultAddr.id);
                    }}
                    data-testid="button-use-saved-address"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Use saved address
                  </Button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Address Label</Label>
                    <Select value={form.label} onValueChange={(v) => setForm({ ...form, label: v })}>
                      <SelectTrigger data-testid="select-address-label">
                        <SelectValue placeholder="Select label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
              </div>
            )}
          </Card>

          {pincodeCheckResult?.checked && (
            <Card className={`p-4 ${pincodeCheckResult.serviceable ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10" : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"}`}>
              <div className="flex items-center gap-3">
                {pincodeCheckResult.serviceable ? (
                  <>
                    <Truck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400" data-testid="text-pincode-serviceable">
                        Delivery available to {pincodeCheckResult.pincode}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        {subtotal >= 1000 ? "Free delivery on this order" : `Delivery charge: Rs. 80 (Free above Rs. 1,000)`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400" data-testid="text-pincode-not-serviceable">
                        Delivery not available to {pincodeCheckResult.pincode}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500">
                        Please try a different delivery address
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
          {pincodeCheckResult?.loading && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Checking delivery availability...</p>
              </div>
            </Card>
          )}

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
                    {appliedCoupon.discountType === "free_shipping"
                      ? "Free shipping on this order"
                      : `You save Rs. ${appliedCoupon.discount.toLocaleString("en-IN")}`}
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
                <span className="text-muted-foreground">Delivery</span>
                {shipping === 0 || appliedCoupon?.discountType === "free_shipping" ? (
                  <span className="text-green-600 dark:text-green-400">Free</span>
                ) : (
                  <span>Rs. {shipping}</span>
                )}
              </div>
              {shipping > 0 && appliedCoupon?.discountType !== "free_shipping" && (
                <p className="text-xs text-muted-foreground">Add Rs. {(1000 - subtotal).toLocaleString("en-IN")} more for free delivery</p>
              )}
              {appliedCoupon && appliedCoupon.discountType !== "free_shipping" && (
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

            <div className="mt-4 p-4 rounded-md border bg-muted/30 space-y-3" data-testid="section-terms">
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-[#C9A961]" />
                Terms & Conditions
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc leading-relaxed">
                <li>You must <strong className="text-foreground">record an unboxing video</strong> while opening your parcel. Without a valid unboxing video, no return request will be processed.</li>
                <li><strong className="text-foreground">Colour/shade changes are not eligible</strong> for return or exchange. Slight colour variations may occur due to screen settings.</li>
                <li><strong className="text-foreground">Size exchanges are not available.</strong> Please check the size guide before ordering.</li>
                <li>Returns are accepted <strong className="text-foreground">only for damaged or defective items</strong> within 2 days of delivery.</li>
                <li>Change of mind, wrong selection, or personal preference is <strong className="text-foreground">not a valid reason</strong> for return.</li>
                <li>Innerwear, undergarments, customized, and tailored products are <strong className="text-foreground">non-returnable</strong>.</li>
                <li>Items must be unused with <strong className="text-foreground">original tags and packaging intact</strong>.</li>
                <li>Shipping charges are <strong className="text-foreground">non-refundable</strong>.</li>
              </ul>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="terms-accept"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  data-testid="checkbox-terms-accept"
                />
                <label htmlFor="terms-accept" className="text-xs text-muted-foreground leading-snug cursor-pointer select-none">
                  I have read and agree to the{" "}
                  <Link href="/return-policy">
                    <span className="text-[#C9A961] hover:underline">return & refund policy</span>
                  </Link>
                  . I understand that I must record an unboxing video and that colour/size changes are not eligible for return.
                </label>
              </div>
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
