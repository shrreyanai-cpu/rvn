import { useState, useEffect } from "react";
import { Wrench, Save, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettings } from "@shared/schema";

export default function AdminSiteSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/site-settings"],
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState("We'll Be Right Back");
  const [maintenanceMessage, setMaintenanceMessage] = useState("Our site is currently undergoing scheduled maintenance. We'll be back shortly.");

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode);
      setMaintenanceTitle(settings.maintenanceTitle || "We'll Be Right Back");
      setMaintenanceMessage(settings.maintenanceMessage || "Our site is currently undergoing scheduled maintenance. We'll be back shortly.");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/admin/site-settings", {
        maintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({ title: "Site settings saved successfully" });
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
          Manage site-wide configurations including maintenance mode
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-base">Maintenance Mode</CardTitle>
              <CardDescription>When enabled, the site shows a maintenance page to all visitors except admins</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">Enable Maintenance Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admins and staff can still log in and browse normally
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
              data-testid="switch-maintenance-mode"
            />
          </div>

          {maintenanceMode && (
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 p-3">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Maintenance mode is currently <strong>ON</strong>. All non-admin visitors will see the maintenance page. Save changes to apply.
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
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Preview</p>
            <div className="rounded-md bg-[#2C3E50] p-4 text-center text-white">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#C9A961]/20 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-[#C9A961]" />
              </div>
              <p className="font-serif font-bold text-sm mb-1">{maintenanceTitle || "We'll Be Right Back"}</p>
              <p className="text-white/60 text-xs">{maintenanceMessage || "Maintenance in progress..."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-base">Admin Bypass</CardTitle>
              <CardDescription>Accounts with admin or staff roles always bypass maintenance mode</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {["super_admin", "manager", "staff"].map((role) => (
              <div key={role} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="capitalize">{role.replace("_", " ")} — Full access during maintenance</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>Customer — Sees maintenance page</span>
            </div>
          </div>
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
