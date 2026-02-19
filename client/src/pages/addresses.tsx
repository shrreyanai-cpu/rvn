import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, MapPin, Trash2, Pencil, Star, Check, Home, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Address } from "@shared/schema";

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

const emptyForm = {
  fullName: "", address: "", city: "", state: "", pincode: "", phone: "", label: "Home",
};

export default function AddressesPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ["/api/user/addresses"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/user/addresses", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      toast({ title: "Address added" });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save address", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/user/addresses/${editingId}`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      toast({ title: "Address updated" });
      setEditingId(null);
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update address", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/user/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      toast({ title: "Address deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete address", variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/user/addresses/${id}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      toast({ title: "Default address updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not set default", variant: "destructive" });
    },
  });

  const isFormValid = form.fullName && form.address && form.city && form.state && form.pincode.length === 6 && form.phone.length === 10;

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      label: addr.label || "Home",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  const labelIcon = (label: string) => {
    if (label === "Work") return <Briefcase className="h-3.5 w-3.5" />;
    return <Home className="h-3.5 w-3.5" />;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/shop">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Shop
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-2" data-testid="text-addresses-title">
          <MapPin className="h-6 w-6" />
          My Addresses
        </h1>
        {!showForm && (
          <Button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
            data-testid="button-add-address"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editingId ? "Edit Address" : "New Address"}</h2>
            <Button variant="ghost" size="icon" onClick={cancelForm} data-testid="button-cancel-form">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Address Label</Label>
              <Select value={form.label} onValueChange={(v) => setForm({ ...form, label: v })}>
                <SelectTrigger data-testid="select-label">
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
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Enter your full name" data-testid="input-full-name" />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" data-testid="input-address" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" data-testid="input-city" />
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.state} onValueChange={(value) => setForm({ ...form, state: value })}>
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>PIN Code</Label>
              <Input
                type="tel" inputMode="numeric" value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="6-digit PIN code" maxLength={6} data-testid="input-pincode"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel" inputMode="numeric" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="10-digit mobile number" maxLength={10} data-testid="input-phone"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
              onClick={() => editingId ? updateMutation.mutate() : createMutation.mutate()}
              data-testid="button-save-address"
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId ? "Update Address" : "Save Address"}
            </Button>
            <Button variant="outline" onClick={cancelForm} data-testid="button-cancel-address">Cancel</Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-md" />
          ))}
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-2">No saved addresses yet</p>
          <p className="text-sm text-muted-foreground">Add an address to speed up your checkout</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-5" data-testid={`address-item-${addr.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium">{addr.fullName}</span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {labelIcon(addr.label || "Home")}
                      {addr.label || "Home"}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#C9A961]/20 text-[#C9A961]">
                        <Check className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {addr.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Phone: {addr.phone}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-2 flex-wrap">
                {!addr.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultMutation.mutate(addr.id)}
                    disabled={setDefaultMutation.isPending}
                    data-testid={`button-set-default-${addr.id}`}
                  >
                    <Star className="mr-1.5 h-3.5 w-3.5" />
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(addr)}
                  data-testid={`button-edit-${addr.id}`}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this address?")) {
                      deleteMutation.mutate(addr.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${addr.id}`}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
