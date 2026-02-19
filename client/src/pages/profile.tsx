import { useState } from "react";
import { Link } from "wouter";
import { User as UserIcon, Lock, MapPin, Package, ArrowLeft, Loader2, Eye, EyeOff, Clock, CheckCircle, Truck, XCircle, CreditCard, ExternalLink, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem, Address } from "@shared/schema";

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
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: profile, isLoading: profileLoading } = useQuery<any>({
    queryKey: ["/api/user/profile"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: addresses } = useQuery<Address[]>({
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

  const handleEditProfile = () => {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setPhone(profile?.phone || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (!firstName.trim()) {
      toast({ title: "Error", description: "First name is required.", variant: "destructive" });
      return;
    }
    updateProfileMutation.mutate({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
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

  const recentOrders = orders?.slice(0, 3) || [];
  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];

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
        My Profile
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
            <Link href="/addresses">
              <Button variant="outline" size="sm" data-testid="button-manage-addresses">
                Manage
              </Button>
            </Link>
          </div>

          {!addresses || addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved addresses yet. Add one from the addresses page.</p>
          ) : (
            <div className="space-y-3">
              {defaultAddress && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium">{defaultAddress.fullName}</span>
                      {defaultAddress.isDefault && (
                        <Badge className="text-[10px] border-0 no-default-hover-elevate no-default-active-elevate bg-[#C9A961]/15 text-[#C9A961]">
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] no-default-hover-elevate no-default-active-elevate">
                        {defaultAddress.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                    </p>
                    <p className="text-muted-foreground">{defaultAddress.phone}</p>
                  </div>
                </div>
              )}
              {addresses.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  + {addresses.length - 1} more address{addresses.length > 2 ? "es" : ""}
                </p>
              )}
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
