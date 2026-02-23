import { useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  startDate: string;
  endDate: string;
  sortOrder: string;
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
    bgColor: banner?.bgColor || "#2C3E50",
    textColor: banner?.textColor || "#FFFFFF",
    isActive: banner?.isActive ?? true,
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split("T")[0] : "",
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split("T")[0] : "",
    sortOrder: banner?.sortOrder?.toString() || "0",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || null,
        bgColor: form.bgColor,
        textColor: form.textColor,
        isActive: form.isActive,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        sortOrder: parseInt(form.sortOrder) || 0,
      };
      if (banner) {
        await apiRequest("PATCH", `/api/admin/banners/${banner.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/banners", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: banner ? "Banner updated" : "Banner created" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save banner", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Banner title"
            data-testid="input-banner-title"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Subtitle</Label>
          <Input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Optional subtitle"
            data-testid="input-banner-subtitle"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Image URL *</Label>
          <Input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            data-testid="input-banner-image-url"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Link URL</Label>
          <Input
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            placeholder="https://example.com/sale"
            data-testid="input-banner-link-url"
          />
        </div>
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
              placeholder="#2C3E50"
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
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            data-testid="input-banner-start-date"
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            data-testid="input-banner-end-date"
          />
        </div>
        <div>
          <Label>Sort Order</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            placeholder="0"
            data-testid="input-banner-sort-order"
          />
        </div>
        <div className="flex items-center gap-2 self-end">
          <Switch
            checked={form.isActive}
            onCheckedChange={(c) => setForm({ ...form, isActive: c })}
            data-testid="switch-banner-active"
          />
          <Label>Active</Label>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Preview</Label>
        <div
          className="rounded-md overflow-hidden relative h-28 flex items-center justify-center"
          style={{ backgroundColor: form.bgColor }}
          data-testid="banner-preview"
        >
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <div className="relative z-10 text-center px-4">
            <h3
              className="font-serif text-lg font-bold"
              style={{ color: form.textColor }}
            >
              {form.title || "Banner Title"}
            </h3>
            {form.subtitle && (
              <p className="text-sm mt-0.5" style={{ color: form.textColor, opacity: 0.85 }}>
                {form.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel-banner">
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.title || !form.imageUrl}
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
      toast({ title: "Banner deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete banner", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/banners/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banner status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const sorted = [...(banners || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-banners-title">
            Seasonal Banners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {banners?.length || 0} total banners
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
              <Plus className="mr-1.5 h-4 w-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
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

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground" data-testid="text-no-banners">
            No banners yet. Create your first seasonal banner.
          </p>
        </Card>
      ) : (
        <>
          <div className="hidden sm:block">
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Dates</TableHead>
                    <TableHead className="hidden lg:table-cell">Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((b) => (
                    <TableRow key={b.id} data-testid={`row-banner-${b.id}`}>
                      <TableCell>
                        <div
                          className="w-24 h-14 rounded-md overflow-hidden relative flex items-center justify-center"
                          style={{ backgroundColor: b.bgColor || "#2C3E50" }}
                        >
                          {b.imageUrl && (
                            <img
                              src={b.imageUrl}
                              alt={b.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                          )}
                          <span
                            className="relative z-10 text-[10px] font-serif font-bold truncate px-1"
                            style={{ color: b.textColor || "#FFFFFF" }}
                          >
                            {b.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-banner-title-${b.id}`}>
                            {b.title}
                          </p>
                          {b.subtitle && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {b.subtitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-xs text-muted-foreground">
                          {b.startDate
                            ? new Date(b.startDate).toLocaleDateString()
                            : "No start"}
                          {" - "}
                          {b.endDate
                            ? new Date(b.endDate).toLocaleDateString()
                            : "No end"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{b.sortOrder}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={b.isActive ? "default" : "secondary"}
                          className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${
                            b.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
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
                            onClick={() =>
                              toggleMutation.mutate({
                                id: b.id,
                                isActive: !b.isActive,
                              })
                            }
                            data-testid={`button-toggle-banner-${b.id}`}
                          >
                            {b.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingBanner(b);
                              setDialogOpen(true);
                            }}
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
                  className="rounded-md overflow-hidden relative h-20 flex items-center justify-center mb-3"
                  style={{ backgroundColor: b.bgColor || "#2C3E50" }}
                >
                  {b.imageUrl && (
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="relative z-10 text-center px-3">
                    <h3
                      className="font-serif text-sm font-bold"
                      style={{ color: b.textColor || "#FFFFFF" }}
                    >
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: b.textColor || "#FFFFFF", opacity: 0.85 }}
                      >
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={b.isActive ? "default" : "secondary"}
                      className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${
                        b.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      } border-0`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Order: {b.sortOrder}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        toggleMutation.mutate({ id: b.id, isActive: !b.isActive })
                      }
                      data-testid={`button-toggle-banner-m-${b.id}`}
                    >
                      {b.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingBanner(b);
                        setDialogOpen(true);
                      }}
                      data-testid={`button-edit-banner-m-${b.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(b.id)}
                      data-testid={`button-delete-banner-m-${b.id}`}
                    >
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
