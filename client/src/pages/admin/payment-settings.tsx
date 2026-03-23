import { useState, useEffect } from "react";
import { CreditCard, Loader2, IndianRupee, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentSettings } from "@shared/schema";

export default function AdminPaymentSettings() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    cashfreeEnabled: true,
    razorpayEnabled: false,
    codEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  const { data: settings, isLoading } = useQuery<PaymentSettings>({
    queryKey: ["/api/admin/payment-settings"],
  });

  useEffect(() => {
    if (settings) {
      setForm({
        cashfreeEnabled: settings.cashfreeEnabled,
        razorpayEnabled: settings.razorpayEnabled,
        codEnabled: settings.codEnabled,
        razorpayKeyId: settings.razorpayKeyId || "",
        razorpayKeySecret: settings.razorpayKeySecret || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/admin/payment-settings", {
        cashfreeEnabled: form.cashfreeEnabled,
        razorpayEnabled: form.razorpayEnabled,
        codEnabled: form.codEnabled,
        razorpayKeyId: form.razorpayKeyId || null,
        razorpayKeySecret: form.razorpayKeySecret || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-settings/active"] });
      toast({ title: "Settings saved", description: "Payment settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save payment settings", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-payment-settings-title">Payment Settings</h1>
        <p className="text-sm text-muted-foreground mt-1" data-testid="text-payment-settings-subtitle">Configure payment gateways and cash on delivery</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-cashfree-title">Cashfree</CardTitle>
            </div>
            <CardDescription>Accept payments via Cashfree payment gateway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.cashfreeEnabled}
                onCheckedChange={(c) => setForm({ ...form, cashfreeEnabled: c })}
                data-testid="switch-cashfree-enabled"
              />
              <div>
                <Label>Enable Cashfree</Label>
                <p className="text-xs text-muted-foreground">Allow customers to pay using Cashfree</p>
              </div>
            </div>
            <Separator />
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Cashfree API keys are configured via environment variables (<code className="text-xs font-mono">CASHFREE_APP_ID</code> and <code className="text-xs font-mono">CASHFREE_SECRET_KEY</code>). Contact your system administrator to update them.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-razorpay-title">Razorpay</CardTitle>
            </div>
            <CardDescription>Accept payments via Razorpay payment gateway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.razorpayEnabled}
                onCheckedChange={(c) => setForm({ ...form, razorpayEnabled: c })}
                data-testid="switch-razorpay-enabled"
              />
              <div>
                <Label>Enable Razorpay</Label>
                <p className="text-xs text-muted-foreground">Allow customers to pay using Razorpay</p>
              </div>
            </div>

            {form.razorpayEnabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Razorpay Key ID</Label>
                    <Input
                      value={form.razorpayKeyId}
                      onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                      placeholder="rzp_live_xxxxxxxxxx"
                      data-testid="input-razorpay-key-id"
                    />
                  </div>
                  <div>
                    <Label>Razorpay Key Secret</Label>
                    <Input
                      type="password"
                      value={form.razorpayKeySecret}
                      onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                      placeholder="Enter Razorpay key secret"
                      data-testid="input-razorpay-key-secret"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-cod-title">Cash on Delivery</CardTitle>
            </div>
            <CardDescription>Allow customers to pay when the order is delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.codEnabled}
                onCheckedChange={(c) => setForm({ ...form, codEnabled: c })}
                data-testid="switch-cod-enabled"
              />
              <div>
                <Label>Enable Cash on Delivery</Label>
                <p className="text-xs text-muted-foreground">Customers can choose to pay in cash when they receive their order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
            data-testid="button-save-payment-settings"
          >
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
