import { useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Tag, LayoutTemplate, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SeasonalBanner } from "@shared/schema";

interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  displayType: string;
}

function BannerForm({
  banner,
  onClose,
}: {
  banner?: SeasonalBanner;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const [form, setForm] = useState<BannerFormData>({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    imageUrl: banner?.imageUrl || "",
    linkUrl: banner?.linkUrl || "",
    bgColor: banner?.bgColor || "#C9A961",
    textColor: banner?.textColor || "#FFFFFF",
    isActive: banner?.isActive ?? true,
    displayType: banner?.displayType || "bar",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        imageUrl: form.imageUrl || null,
        linkUrl: form.linkUrl || null,
        bgColor: form.bgColor,
        textColor: form.textColor,
        isActive: form.isActive,
        displayType: form.displayType,
        sortOrder: banner?.sortOrder ?? 0,
      };
      if (banner) {
        await apiRequest("PATCH", `/api/admin/banners/${banner.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/banners", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: banner ? "Banner updated" : "Banner created" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save banner", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Announcement Text *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Flat 20% OFF on all Sarees – Limited Time!"
            data-testid="input-banner-title"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Subtitle <span className="text-muted-foreground text-xs">(optional, shown in popup mode)</span></Label>
          <Input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="e.g. Use code SAVE20 at checkout"
            data-testid="input-banner-subtitle"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Display Style</Label>
          <Select value={form.displayType} onValueChange={(v) => setForm({ ...form, displayType: v })}>
            <SelectTrigger data-testid="select-banner-display-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  Bar Strip — thin announcement strip below navbar on all pages
                </div>
              </SelectItem>
              <SelectItem value="popup">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Popup — dismissible overlay shown once per session
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Link URL <span className="text-muted-foreground text-xs">(optional, makes banner clickable)</span></Label>
          <Input
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            placeholder="https://yourdomain.com/sale"
            data-testid="input-banner-link-url"
          />
        </div>
        {form.displayType === "popup" && (
          <div className="sm:col-span-2">
            <Label>Popup Image URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/sale-image.jpg"
              data-testid="input-banner-image-url"
            />
          </div>
        )}
        <div>
          <Label>Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="h-9 w-12 rounded-md border cursor-pointer"
              data-testid="input-banner-bg-color-picker"
            />
            <Input
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              placeholder="#C9A961"
              data-testid="input-banner-bg-color"
            />
          </div>
        </div>
        <div>
          <Label>Text Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.textColor}
              onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              className="h-9 w-12 rounded-md border cursor-pointer"
              data-testid="input-banner-text-color-picker"
            />
            <Input
              value={form.textColor}
              onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              placeholder="#FFFFFF"
              data-testid="input-banner-text-color"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:col-span-2 pt-1">
          <Switch
            checked={form.isActive}
            onCheckedChange={(c) => setForm({ ...form, isActive: c })}
            data-testid="switch-banner-active"
          />
          <div>
            <Label className="cursor-pointer">Active</Label>
            <p className="text-xs text-muted-foreground">Only one active banner displays at a time</p>
          </div>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Live Preview</Label>
        {form.displayType === "bar" ? (
          <div
            className="relative rounded-md overflow-hidden flex items-center justify-center px-10 py-2"
            style={{ backgroundColor: form.bgColor }}
            data-testid="banner-preview-bar"
          >
            <div className="flex items-center gap-2" style={{ color: form.textColor }}>
              <Tag className="h-3 w-3 shrink-0" />
              <span className="text-sm font-medium truncate">{form.title || "Announcement text here"}</span>
              {form.subtitle && <span className="text-xs opacity-80 hidden sm:inline">— {form.subtitle}</span>}
            </div>
            <div className="absolute right-2 opacity-50" style={{ color: form.textColor }}>✕</div>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden relative max-w-xs"
            style={{ backgroundColor: form.bgColor }}
            data-testid="banner-preview-popup"
          >
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="w-full h-28 object-cover" />
            )}
            <div className="p-4 text-center" style={{ color: form.textColor }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Tag className="h-3 w-3" />
                <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Special Offer</span>
              </div>
              <p className="font-serif text-base font-bold">{form.title || "Popup title here"}</p>
              {form.subtitle && <p className="text-xs opacity-80 mt-1">{form.subtitle}</p>}
              <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs bg-white/20 border border-white/30">
                {form.linkUrl ? "Shop Now" : "Got it!"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel-banner">
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.title}
          className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
          data-testid="button-save-banner"
        >
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {banner ? "Update Banner" : "Create Banner"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const { toast } = useToast();
  const [editingBanner, setEditingBanner] = useState<SeasonalBanner | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: banners, isLoading } = useQuery<SeasonalBanner[]>({
    queryKey: ["/api/admin/banners"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/banners/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const activeBanner = banners?.find((b) => b.isActive);
  const sorted = [...(banners || [])].sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-banners-title">
            Sale Banner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Display a promotional announcement strip or popup across the site
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingBanner(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
              data-testid="button-add-banner"
            >
              <Plus className="mr-1.5 h-4 w-4" /> New Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingBanner ? "Edit Sale Banner" : "Create Sale Banner"}
              </DialogTitle>
            </DialogHeader>
            <BannerForm
              banner={editingBanner}
              onClose={() => {
                setDialogOpen(false);
                setEditingBanner(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {activeBanner && (
        <Card className="mb-6 border-[#C9A961]/40 bg-[#C9A961]/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Currently Active</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div
              className={`rounded-lg overflow-hidden ${activeBanner.displayType === "bar" ? "flex items-center justify-center px-10 py-2" : "max-w-xs"}`}
              style={{ backgroundColor: activeBanner.bgColor || "#C9A961" }}
            >
              {activeBanner.displayType === "bar" ? (
                <div className="flex items-center gap-2" style={{ color: activeBanner.textColor || "#FFF" }}>
                  <Tag className="h-3 w-3" />
                  <span className="text-sm font-medium">{activeBanner.title}</span>
                  {activeBanner.subtitle && <span className="text-xs opacity-80">— {activeBanner.subtitle}</span>}
                </div>
              ) : (
                <div className="p-4 text-center" style={{ color: activeBanner.textColor || "#FFF" }}>
                  <p className="font-serif font-bold">{activeBanner.title}</p>
                  {activeBanner.subtitle && <p className="text-xs opacity-80 mt-1">{activeBanner.subtitle}</p>}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Showing as: <span className="font-medium capitalize">{activeBanner.displayType === "bar" ? "Bar strip (below navbar on all pages)" : "Popup (once per session)"}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-8 text-center">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium" data-testid="text-no-banners">
            No sale banners yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">Create a banner to announce sales, offers, or events across your site.</p>
        </Card>
      ) : (
        <>
          <div className="hidden sm:block">
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Announcement</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((b) => (
                    <TableRow key={b.id} data-testid={`row-banner-${b.id}`}>
                      <TableCell>
                        <div
                          className="w-28 h-9 rounded-md flex items-center justify-center px-2"
                          style={{ backgroundColor: b.bgColor || "#C9A961" }}
                        >
                          <span className="text-[10px] font-medium truncate" style={{ color: b.textColor || "#FFF" }}>
                            {b.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm" data-testid={`text-banner-title-${b.id}`}>{b.title}</p>
                        {b.subtitle && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{b.subtitle}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] gap-1 no-default-hover-elevate no-default-active-elevate">
                          {b.displayType === "bar" ? <LayoutTemplate className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
                          {b.displayType === "bar" ? "Bar" : "Popup"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={b.isActive ? "default" : "secondary"}
                          className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${
                            b.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
                          } border-0`}
                          data-testid={`badge-banner-status-${b.id}`}
                        >
                          {b.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleMutation.mutate({ id: b.id, isActive: !b.isActive })}
                            title={b.isActive ? "Deactivate" : "Activate"}
                            data-testid={`button-toggle-banner-${b.id}`}
                          >
                            {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => { setEditingBanner(b); setDialogOpen(true); }}
                            data-testid={`button-edit-banner-${b.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(b.id)}
                            data-testid={`button-delete-banner-${b.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="sm:hidden space-y-3">
            {sorted.map((b) => (
              <Card key={b.id} className="p-3" data-testid={`card-banner-${b.id}`}>
                <div
                  className="rounded-md h-9 flex items-center justify-center px-4 mb-3"
                  style={{ backgroundColor: b.bgColor || "#C9A961" }}
                >
                  <span className="text-xs font-medium truncate" style={{ color: b.textColor || "#FFF" }}>{b.title}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={b.isActive ? "default" : "secondary"}
                      className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${b.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"} border-0`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] no-default-hover-elevate no-default-active-elevate capitalize">{b.displayType}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleMutation.mutate({ id: b.id, isActive: !b.isActive })} data-testid={`button-toggle-banner-m-${b.id}`}>
                      {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingBanner(b); setDialogOpen(true); }} data-testid={`button-edit-banner-m-${b.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(b.id)} data-testid={`button-delete-banner-m-${b.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
