import { useState } from "react";
import { Link } from "wouter";
import {
  User as UserIcon, Lock, MapPin, Package, ArrowLeft, Loader2, Eye, EyeOff,
  Clock, CheckCircle, Truck, XCircle, CreditCard, ExternalLink, Phone, Mail,
  Calendar, Plus, Trash2, Pencil, Star, Check, Home, Briefcase, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem, Address } from "@shared/schema";

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

const emptyAddressForm = {
  fullName: "", address: "", city: "", state: "", pincode: "", phone: "", label: "Home",
};

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", icon: Package, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  const { data: profile, isLoading: profileLoading } = useQuery<any>({
    queryKey: ["/api/user/profile"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/user/addresses"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; phone: string }) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditingProfile(false);
      toast({ title: "Profile updated", description: "Your personal information has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update profile. Please try again.", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PUT", "/api/user/password", data);
      return res.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Could not change password. Please try again.", variant: "destructive" });
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/user/addresses", addressForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      toast({ title: "Address added" });
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save address", variant: "destructive" });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/user/addresses/${editingAddressId}`, addressForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      toast({ title: "Address updated" });
      setEditingAddressId(null);
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update address", variant: "destructive" });
    },
  });

  const deleteAddressMutation = useMutation({
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

  const handleEditProfile = () => {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setProfilePhone(profile?.phone || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (!firstName.trim()) {
      toast({ title: "Error", description: "First name is required.", variant: "destructive" });
      return;
    }
    updateProfileMutation.mutate({ firstName: firstName.trim(), lastName: lastName.trim(), phone: profilePhone.trim() });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast({ title: "Error", description: "Please enter your current password.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  function startEditAddress(addr: Address) {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      label: addr.label || "Home",
    });
    setShowAddressForm(true);
  }

  function cancelAddressForm() {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
  }

  const isAddressFormValid = addressForm.fullName && addressForm.address && addressForm.city && addressForm.state && addressForm.pincode.length === 6 && addressForm.phone.length === 10;

  const labelIcon = (label: string) => {
    if (label === "Work") return <Briefcase className="h-3.5 w-3.5" />;
    return <Home className="h-3.5 w-3.5" />;
  };

  const recentOrders = orders?.slice(0, 3) || [];

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6" data-testid="text-profile-title">
        My Account
      </h1>

      <div className="space-y-6">
        <Card className="p-5 sm:p-6" data-testid="card-personal-info">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[#C9A961]" />
              <h2 className="font-serif text-lg font-semibold">Personal Information</h2>
            </div>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={handleEditProfile} data-testid="button-edit-profile">
                Edit
              </Button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profilePhone">Phone Number</Label>
                <Input
                  id="profilePhone"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="Phone number"
                  data-testid="input-phone"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditingProfile(false)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium" data-testid="text-profile-name">
                    {profile?.firstName || ""} {profile?.lastName || ""}
                    {!profile?.firstName && !profile?.lastName && <span className="text-muted-foreground italic">Not set</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium" data-testid="text-profile-email">{profile?.email || "Not set"}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium" data-testid="text-profile-phone">
                    {profile?.phone || <span className="text-muted-foreground italic">Not set</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="font-medium" data-testid="text-profile-joined">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6" data-testid="card-change-password">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#C9A961]" />
              <h2 className="font-serif text-lg font-semibold">Change Password</h2>
            </div>
            {!isChangingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                data-testid="button-change-password"
              >
                Change
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    data-testid="input-current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    data-testid="button-toggle-current-password"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    data-testid="button-toggle-new-password"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                  data-testid="button-save-password"
                >
                  {changePasswordMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  data-testid="button-cancel-password"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Keep your account secure by using a strong password that you don't use for other websites.
            </p>
          )}
        </Card>

        <Card className="p-5 sm:p-6" data-testid="card-saved-addresses">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#C9A961]" />
              <h2 className="font-serif text-lg font-semibold">Saved Addresses</h2>
            </div>
            {!showAddressForm && (
              <Button
                size="sm"
                onClick={() => {
                  setAddressForm(emptyAddressForm);
                  setEditingAddressId(null);
                  setShowAddressForm(true);
                }}
                data-testid="button-add-address"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Address
              </Button>
            )}
          </div>

          {showAddressForm && (
            <div className="mb-5 p-4 rounded-md border bg-muted/30">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold text-sm">{editingAddressId ? "Edit Address" : "New Address"}</h3>
                <Button variant="ghost" size="icon" onClick={cancelAddressForm} data-testid="button-cancel-address-form">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Address Label</Label>
                  <Select value={addressForm.label} onValueChange={(v) => setAddressForm({ ...addressForm, label: v })}>
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
                  <Input value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} placeholder="Enter your full name" data-testid="input-addr-full-name" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} placeholder="Street address" data-testid="input-addr-address" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" data-testid="input-addr-city" />
                </div>
                <div>
                  <Label>State</Label>
                  <Select value={addressForm.state} onValueChange={(value) => setAddressForm({ ...addressForm, state: value })}>
                    <SelectTrigger data-testid="select-addr-state">
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
                    type="tel" inputMode="numeric" value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="6-digit PIN code" maxLength={6} data-testid="input-addr-pincode"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel" inputMode="numeric" value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit mobile number" maxLength={10} data-testid="input-addr-phone"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  disabled={!isAddressFormValid || createAddressMutation.isPending || updateAddressMutation.isPending}
                  onClick={() => editingAddressId ? updateAddressMutation.mutate() : createAddressMutation.mutate()}
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                  data-testid="button-save-address"
                >
                  {(createAddressMutation.isPending || updateAddressMutation.isPending) ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                </Button>
                <Button variant="ghost" onClick={cancelAddressForm} data-testid="button-cancel-address">Cancel</Button>
              </div>
            </div>
          )}

          {addressesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-md" />
              ))}
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <div className="text-center py-6">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No saved addresses yet. Add one to speed up checkout.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-md border" data-testid={`address-item-${addr.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{addr.fullName}</span>
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
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Phone: {addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t">
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
                      onClick={() => startEditAddress(addr)}
                      data-testid={`button-edit-addr-${addr.id}`}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this address?")) {
                          deleteAddressMutation.mutate(addr.id);
                        }
                      }}
                      disabled={deleteAddressMutation.isPending}
                      data-testid={`button-delete-addr-${addr.id}`}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6" data-testid="card-recent-orders">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#C9A961]" />
              <h2 className="font-serif text-lg font-semibold">Recent Orders</h2>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm" data-testid="button-view-all-orders">
                View All
              </Button>
            </Link>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No orders yet</p>
              <Link href="/shop">
                <Button size="sm" className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-start-shopping">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const items = (order.items as OrderItem[]) || [];
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-md border" data-testid={`card-recent-order-${order.id}`}>
                    <div className="flex -space-x-2 flex-shrink-0">
                      {items.slice(0, 2).map((item, i) => (
                        <div key={i} className="w-10 h-12 rounded overflow-hidden border-2 border-background bg-muted">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">#{order.id}</span>
                        <Badge
                          className={`text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate ${status.className}`}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        {(order as any).paymentStatus === "paid" && (
                          <Badge className="text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CreditCard className="mr-1 h-3 w-3" />
                            Paid
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {items.length} item{items.length > 1 ? "s" : ""} &middot;{" "}
                        {new Date(order.createdAt!).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold" data-testid={`text-recent-order-total-${order.id}`}>
                        Rs. {Number(order.totalAmount).toLocaleString("en-IN")}
                      </span>
                      {(order as any).trackingUrl && (
                        <a
                          href={(order as any).trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-[#C9A961] hover:underline mt-0.5"
                          data-testid={`link-track-recent-order-${order.id}`}
                        >
                          Track <ExternalLink className="inline h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {orders.length > 3 && (
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="w-full text-[#C9A961]" data-testid="button-see-all-orders">
                    See all {orders.length} orders
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
