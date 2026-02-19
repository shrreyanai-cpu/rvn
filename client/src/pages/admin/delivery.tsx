import { useState, useEffect } from "react";
import { Truck, Globe, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DeliverySettings } from "@shared/schema";

export default function AdminDelivery() {
  const { toast } = useToast();
  const [testPincode, setTestPincode] = useState("");

  const [form, setForm] = useState({
    freeDeliveryEnabled: true,
    freeDeliveryThreshold: "",
    flatDeliveryCharge: "",
    perKgCharge: "",
    delhiveryEnvironment: "staging",
    delhiveryApiToken: "",
    delhiveryWarehouseName: "",
    delhiveryPickupPincode: "",
    delhiveryPickupAddress: "",
    delhiveryPickupCity: "",
    delhiveryPickupState: "",
    delhiveryPickupPhone: "",
    sellerName: "",
    sellerGstTin: "",
  });

  const { data: settings, isLoading } = useQuery<DeliverySettings>({
    queryKey: ["/api/admin/delivery-settings"],
  });

  useEffect(() => {
    if (settings) {
      setForm({
        freeDeliveryEnabled: settings.freeDeliveryEnabled,
        freeDeliveryThreshold: settings.freeDeliveryThreshold || "",
        flatDeliveryCharge: settings.flatDeliveryCharge || "",
        perKgCharge: settings.perKgCharge || "",
        delhiveryEnvironment: settings.delhiveryEnvironment || "staging",
        delhiveryApiToken: settings.delhiveryApiToken || "",
        delhiveryWarehouseName: settings.delhiveryWarehouseName || "",
        delhiveryPickupPincode: settings.delhiveryPickupPincode || "",
        delhiveryPickupAddress: settings.delhiveryPickupAddress || "",
        delhiveryPickupCity: settings.delhiveryPickupCity || "",
        delhiveryPickupState: settings.delhiveryPickupState || "",
        delhiveryPickupPhone: settings.delhiveryPickupPhone || "",
        sellerName: settings.sellerName || "",
        sellerGstTin: settings.sellerGstTin || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/admin/delivery-settings", {
        freeDeliveryEnabled: form.freeDeliveryEnabled,
        freeDeliveryThreshold: form.freeDeliveryThreshold || null,
        flatDeliveryCharge: form.flatDeliveryCharge || null,
        perKgCharge: form.perKgCharge || null,
        delhiveryEnvironment: form.delhiveryEnvironment,
        delhiveryApiToken: form.delhiveryApiToken || null,
        delhiveryWarehouseName: form.delhiveryWarehouseName || null,
        delhiveryPickupPincode: form.delhiveryPickupPincode || null,
        delhiveryPickupAddress: form.delhiveryPickupAddress || null,
        delhiveryPickupCity: form.delhiveryPickupCity || null,
        delhiveryPickupState: form.delhiveryPickupState || null,
        delhiveryPickupPhone: form.delhiveryPickupPhone || null,
        sellerName: form.sellerName || null,
        sellerGstTin: form.sellerGstTin || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-settings"] });
      toast({ title: "Settings saved", description: "Delivery settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save delivery settings", variant: "destructive" });
    },
  });

  const pincodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/delhivery/check-pincode", { pincode: testPincode });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.serviceable) {
        toast({ title: "Serviceable", description: `Pincode ${testPincode} is serviceable by Delhivery` });
      } else {
        toast({ title: "Not Serviceable", description: `Pincode ${testPincode} is not serviceable`, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to check pincode serviceability", variant: "destructive" });
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
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-delivery-title">Delivery & Shipping</h1>
        <p className="text-sm text-muted-foreground mt-1" data-testid="text-delivery-subtitle">Manage delivery charges and Delhivery courier integration</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-delivery-charges-title">Delivery Charges</CardTitle>
            </div>
            <CardDescription>Configure delivery pricing for orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.freeDeliveryEnabled}
                onCheckedChange={(c) => setForm({ ...form, freeDeliveryEnabled: c })}
                data-testid="switch-free-delivery"
              />
              <Label>Free Delivery</Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Free Delivery Threshold (Rs.)</Label>
                <Input
                  type="number"
                  value={form.freeDeliveryThreshold}
                  onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
                  placeholder="e.g., 999"
                  data-testid="input-free-delivery-threshold"
                />
              </div>
              <div>
                <Label>Flat Delivery Charge (Rs.)</Label>
                <Input
                  type="number"
                  value={form.flatDeliveryCharge}
                  onChange={(e) => setForm({ ...form, flatDeliveryCharge: e.target.value })}
                  placeholder="e.g., 99"
                  data-testid="input-flat-delivery-charge"
                />
              </div>
              <div>
                <Label>Per Kg Charge (Rs.)</Label>
                <Input
                  type="number"
                  value={form.perKgCharge}
                  onChange={(e) => setForm({ ...form, perKgCharge: e.target.value })}
                  placeholder="e.g., 25"
                  data-testid="input-per-kg-charge"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-delhivery-title">Delhivery Integration</CardTitle>
            </div>
            <CardDescription>Configure Delhivery courier API and pickup details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Environment</Label>
                <Select value={form.delhiveryEnvironment} onValueChange={(v) => setForm({ ...form, delhiveryEnvironment: v })}>
                  <SelectTrigger data-testid="select-delhivery-environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>API Token</Label>
                <Input
                  type="password"
                  value={form.delhiveryApiToken}
                  onChange={(e) => setForm({ ...form, delhiveryApiToken: e.target.value })}
                  placeholder="Enter Delhivery API token"
                  data-testid="input-delhivery-api-token"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Warehouse Name</Label>
                <Input
                  value={form.delhiveryWarehouseName}
                  onChange={(e) => setForm({ ...form, delhiveryWarehouseName: e.target.value })}
                  placeholder="Warehouse name"
                  data-testid="input-warehouse-name"
                />
              </div>
              <div>
                <Label>Pickup Pincode</Label>
                <Input
                  value={form.delhiveryPickupPincode}
                  onChange={(e) => setForm({ ...form, delhiveryPickupPincode: e.target.value })}
                  placeholder="e.g., 110001"
                  data-testid="input-pickup-pincode"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Pickup Address</Label>
                <Input
                  value={form.delhiveryPickupAddress}
                  onChange={(e) => setForm({ ...form, delhiveryPickupAddress: e.target.value })}
                  placeholder="Full pickup address"
                  data-testid="input-pickup-address"
                />
              </div>
              <div>
                <Label>Pickup City</Label>
                <Input
                  value={form.delhiveryPickupCity}
                  onChange={(e) => setForm({ ...form, delhiveryPickupCity: e.target.value })}
                  placeholder="City"
                  data-testid="input-pickup-city"
                />
              </div>
              <div>
                <Label>Pickup State</Label>
                <Input
                  value={form.delhiveryPickupState}
                  onChange={(e) => setForm({ ...form, delhiveryPickupState: e.target.value })}
                  placeholder="State"
                  data-testid="input-pickup-state"
                />
              </div>
              <div>
                <Label>Pickup Phone</Label>
                <Input
                  value={form.delhiveryPickupPhone}
                  onChange={(e) => setForm({ ...form, delhiveryPickupPhone: e.target.value })}
                  placeholder="Phone number"
                  data-testid="input-pickup-phone"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Seller Name</Label>
                <Input
                  value={form.sellerName}
                  onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                  placeholder="Seller / business name"
                  data-testid="input-seller-name"
                />
              </div>
              <div>
                <Label>Seller GST TIN</Label>
                <Input
                  value={form.sellerGstTin}
                  onChange={(e) => setForm({ ...form, sellerGstTin: e.target.value })}
                  placeholder="GST TIN number"
                  data-testid="input-seller-gst-tin"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="mb-2 block">Test Pincode Serviceability</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={testPincode}
                  onChange={(e) => setTestPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="max-w-[200px]"
                  data-testid="input-test-pincode"
                />
                <Button
                  variant="outline"
                  onClick={() => pincodeMutation.mutate()}
                  disabled={pincodeMutation.isPending || !testPincode}
                  data-testid="button-test-pincode"
                >
                  {pincodeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                  Test Pincode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
            data-testid="button-save-settings"
          >
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}