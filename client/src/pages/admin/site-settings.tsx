import { useState, useEffect, useMemo } from "react";
import { Wrench, Save, Loader2, AlertTriangle, ShieldCheck, Users, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettings } from "@shared/schema";

const ALL_ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "manager", label: "Manager", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "staff", label: "Staff", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "customer", label: "Customer", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
];

interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
}

export default function AdminSiteSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/site-settings"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState("We'll Be Right Back");
  const [maintenanceMessage, setMaintenanceMessage] = useState("Our site is currently undergoing scheduled maintenance. We'll be back shortly.");
  const [allowedRoles, setAllowedRoles] = useState<string[]>(["super_admin", "manager", "staff"]);
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode);
      setMaintenanceTitle(settings.maintenanceTitle || "We'll Be Right Back");
      setMaintenanceMessage(settings.maintenanceMessage || "Our site is currently undergoing scheduled maintenance. We'll be back shortly.");
      setAllowedRoles(settings.allowedRoles ?? ["super_admin", "manager", "staff"]);
      setAllowedUserIds(settings.allowedUserIds ?? []);
    }
  }, [settings]);

  const toggleRole = (role: string) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleUser = (userId: string) => {
    setAllowedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredCustomers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase().includes(q)
    );
  }, [customers, userSearch]);

  const selectedUsers = customers.filter((c) => allowedUserIds.includes(c.id));

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/admin/site-settings", {
        maintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
        allowedRoles,
        allowedUserIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({ title: "Site settings saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-site-settings-title">
          Site Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control maintenance mode and who can access the site during it
        </p>
      </div>

      {/* Maintenance toggle + message */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-base">Maintenance Mode</CardTitle>
              <CardDescription>Shows a maintenance page to blocked visitors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">Enable Maintenance Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Only allowed roles & users can access the site</p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
              data-testid="switch-maintenance-mode"
            />
          </div>

          {maintenanceMode && (
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 p-3">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Maintenance mode is <strong>ON</strong>. Users not in the allowed list will see the maintenance page.
              </p>
            </div>
          )}

          <div>
            <Label>Page Title</Label>
            <Input
              value={maintenanceTitle}
              onChange={(e) => setMaintenanceTitle(e.target.value)}
              placeholder="We'll Be Right Back"
              className="mt-1"
              data-testid="input-maintenance-title"
            />
          </div>

          <div>
            <Label>Message to Visitors</Label>
            <Textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Our site is currently undergoing scheduled maintenance..."
              rows={3}
              className="mt-1 resize-none"
              data-testid="input-maintenance-message"
            />
          </div>

          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Preview</p>
            <div className="rounded-md bg-[#2C3E50] p-4 text-center text-white">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[#C9A961]/20 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-[#C9A961]" />
              </div>
              <p className="font-serif font-bold text-sm mb-1">{maintenanceTitle || "We'll Be Right Back"}</p>
              <p className="text-white/60 text-xs">{maintenanceMessage || "Maintenance in progress..."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role access control */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base">Allowed Roles</CardTitle>
              <CardDescription>Users with these roles can bypass the maintenance page</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {ALL_ROLES.map((role) => {
              const checked = allowedRoles.includes(role.value);
              return (
                <label
                  key={role.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    checked ? "border-[#2C3E50] bg-[#2C3E50]/5 dark:border-[#C9A961] dark:bg-[#C9A961]/5" : "hover:bg-muted/40"
                  }`}
                  data-testid={`checkbox-role-${role.value}`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleRole(role.value)}
                    className="shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{role.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold w-fit ${role.color}`}>
                      {checked ? "Can access" : "Blocked"}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Tip: Keep "Super Admin" always checked so you never lock yourself out.
          </p>
        </CardContent>
      </Card>

      {/* Specific user access */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-base">Allowed Users</CardTitle>
              <CardDescription>Grant access to specific accounts regardless of their role</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedUsers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Selected ({selectedUsers.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <Badge
                    key={u.id}
                    variant="secondary"
                    className="flex items-center gap-1.5 pr-1 no-default-hover-elevate no-default-active-elevate"
                    data-testid={`badge-allowed-user-${u.id}`}
                  >
                    <span className="text-xs">{u.firstName || u.email.split("@")[0]}</span>
                    <button
                      onClick={() => toggleUser(u.id)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      data-testid={`button-remove-user-${u.id}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-9"
              data-testid="input-user-search"
            />
          </div>

          <div className="max-h-52 overflow-y-auto rounded-lg border divide-y">
            {filteredCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
            ) : (
              filteredCustomers.map((customer) => {
                const isSelected = allowedUserIds.includes(customer.id);
                const initials = `${(customer.firstName || "")[0] || ""}${(customer.lastName || "")[0] || ""}`.toUpperCase() || "?";
                const roleInfo = ALL_ROLES.find((r) => r.value === customer.role);
                return (
                  <button
                    key={customer.id}
                    onClick={() => toggleUser(customer.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-[#2C3E50]/5 dark:bg-[#C9A961]/5" : ""}`}
                    data-testid={`button-select-user-${customer.id}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-[#2C3E50] text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleInfo?.color || "bg-gray-100 text-gray-600"}`}>
                        {roleInfo?.label || customer.role}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-[#2C3E50] dark:text-[#C9A961]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Users selected here can access the site even if their role is blocked above.
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
        data-testid="button-save-site-settings"
      >
        {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Settings
      </Button>
    </div>
  );
}
