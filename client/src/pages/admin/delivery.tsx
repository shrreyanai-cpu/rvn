import { useState, useEffect } from "react";
import { Truck, Globe, Loader2, MapPin, Calculator, Package, Calendar, Warehouse, FileText, Download } from "lucide-react";
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
  const [costCalc, setCostCalc] = useState({ destinationPincode: "", weight: "0.5", mode: "S" });
  const [costResult, setCostResult] = useState<any>(null);
  const [pickupForm, setPickupForm] = useState({ pickupDate: "", pickupTime: "12:00:00", packageCount: "1" });
  const [waybillCount, setWaybillCount] = useState("1");
  const [waybillResult, setWaybillResult] = useState<any>(null);

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

  const costMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/delhivery/shipping-cost", {
        destinationPincode: costCalc.destinationPincode,
        weight: Number(costCalc.weight),
        mode: costCalc.mode,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setCostResult(data);
      const charges = data?.[0]?.total_amount;
      if (charges !== undefined) {
        toast({ title: "Cost Calculated", description: `Estimated shipping: Rs. ${charges}` });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to calculate shipping cost", variant: "destructive" });
    },
  });

  const pickupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/delhivery/pickup-request", {
        pickupDate: pickupForm.pickupDate,
        pickupTime: pickupForm.pickupTime,
        packageCount: Number(pickupForm.packageCount),
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Pickup Requested", description: data?.data?.pickup_id ? `Pickup ID: ${data.data.pickup_id}` : "Pickup request submitted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create pickup request", variant: "destructive" });
    },
  });

  const waybillMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/delhivery/fetch-waybill", { count: Number(waybillCount) });
      return res.json();
    },
    onSuccess: (data: any) => {
      setWaybillResult(data);
      toast({ title: "Waybills Generated", description: `${waybillCount} waybill(s) fetched` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to fetch waybills", variant: "destructive" });
    },
  });

  const warehouseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/delhivery/create-warehouse");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Warehouse Registered", description: data?.data?.success ? "Warehouse registered with Delhivery" : "Registration request sent" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to register warehouse", variant: "destructive" });
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="col-span-1 sm:col-span-2">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  value={testPincode}
                  onChange={(e) => setTestPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="flex-1 sm:max-w-[200px]"
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

        <div className="flex flex-col sm:flex-row justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
            data-testid="button-save-settings"
          >
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Settings
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-cost-calculator-title">Shipping Cost Calculator</CardTitle>
            </div>
            <CardDescription>Calculate Delhivery shipping cost for a destination pincode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Destination Pincode</Label>
                <Input
                  value={costCalc.destinationPincode}
                  onChange={(e) => setCostCalc({ ...costCalc, destinationPincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="e.g., 400001"
                  maxLength={6}
                  data-testid="input-cost-destination-pincode"
                />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={costCalc.weight}
                  onChange={(e) => setCostCalc({ ...costCalc, weight: e.target.value })}
                  placeholder="e.g., 0.5"
                  step="0.1"
                  min="0.1"
                  data-testid="input-cost-weight"
                />
              </div>
              <div>
                <Label>Shipping Mode</Label>
                <Select value={costCalc.mode} onValueChange={(v) => setCostCalc({ ...costCalc, mode: v })}>
                  <SelectTrigger data-testid="select-cost-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Surface</SelectItem>
                    <SelectItem value="E">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => costMutation.mutate()}
                disabled={costMutation.isPending || !costCalc.destinationPincode}
                data-testid="button-calculate-cost"
              >
                {costMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                Calculate Cost
              </Button>
            </div>
            {costResult && (
              <div className="p-3 rounded bg-muted/50 text-sm space-y-1" data-testid="text-cost-result">
                {costResult?.[0] ? (
                  <>
                    <p><span className="text-muted-foreground">Total:</span> <span className="font-medium">Rs. {costResult[0].total_amount}</span></p>
                    {costResult[0].charge_weight && <p><span className="text-muted-foreground">Charged Weight:</span> {costResult[0].charge_weight} gm</p>}
                    {costResult[0].freight_charge && <p><span className="text-muted-foreground">Freight:</span> Rs. {costResult[0].freight_charge}</p>}
                    {costResult[0].cod_charges !== undefined && <p><span className="text-muted-foreground">COD:</span> Rs. {costResult[0].cod_charges}</p>}
                  </>
                ) : (
                  <p className="text-muted-foreground">No cost data returned. Check your credentials and pincode.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C9A961]" />
              <CardTitle className="font-serif" data-testid="text-pickup-title">Schedule Pickup</CardTitle>
            </div>
            <CardDescription>Request Delhivery to pick up packages from your warehouse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Pickup Date</Label>
                <Input
                  type="date"
                  value={pickupForm.pickupDate}
                  onChange={(e) => setPickupForm({ ...pickupForm, pickupDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  data-testid="input-pickup-date"
                />
              </div>
              <div>
                <Label>Pickup Time</Label>
                <Input
                  type="time"
                  value={pickupForm.pickupTime.slice(0, 5)}
                  onChange={(e) => setPickupForm({ ...pickupForm, pickupTime: e.target.value + ":00" })}
                  data-testid="input-pickup-time"
                />
              </div>
              <div>
                <Label>Expected Packages</Label>
                <Input
                  type="number"
                  value={pickupForm.packageCount}
                  onChange={(e) => setPickupForm({ ...pickupForm, packageCount: e.target.value })}
                  min="1"
                  data-testid="input-package-count"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => pickupMutation.mutate()}
              disabled={pickupMutation.isPending || !pickupForm.pickupDate}
              data-testid="button-schedule-pickup"
            >
              {pickupMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              Schedule Pickup
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Package className="h-5 w-5 text-[#C9A961]" />
                <CardTitle className="font-serif text-base" data-testid="text-waybill-title">Fetch Waybills</CardTitle>
              </div>
              <CardDescription>Pre-generate Delhivery waybill numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Number of Waybills</Label>
                <Input
                  type="number"
                  value={waybillCount}
                  onChange={(e) => setWaybillCount(e.target.value)}
                  min="1"
                  max="50"
                  data-testid="input-waybill-count"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => waybillMutation.mutate()}
                disabled={waybillMutation.isPending}
                className="w-full"
                data-testid="button-fetch-waybills"
              >
                {waybillMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Fetch Waybills
              </Button>
              {waybillResult && (
                <div className="p-3 rounded bg-muted/50 text-sm" data-testid="text-waybill-result">
                  <p className="text-muted-foreground mb-1">Generated Waybills:</p>
                  <p className="font-mono text-xs break-all">
                    {Array.isArray(waybillResult) ? waybillResult.join(", ") : waybillResult?.waybills?.join(", ") || JSON.stringify(waybillResult)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Warehouse className="h-5 w-5 text-[#C9A961]" />
                <CardTitle className="font-serif text-base" data-testid="text-warehouse-title">Register Warehouse</CardTitle>
              </div>
              <CardDescription>Register your pickup location with Delhivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will register the warehouse details you configured above with Delhivery's system. Make sure you've saved your settings first.
              </p>
              <Button
                variant="outline"
                onClick={() => warehouseMutation.mutate()}
                disabled={warehouseMutation.isPending}
                className="w-full"
                data-testid="button-register-warehouse"
              >
                {warehouseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Warehouse className="mr-2 h-4 w-4" />}
                Register Warehouse
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}