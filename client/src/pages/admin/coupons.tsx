import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Coupon } from "@shared/schema";

function CouponForm({ coupon, onClose }: { coupon?: Coupon; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    code: coupon?.code || "",
    description: coupon?.description || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue || "",
    minOrderAmount: coupon?.minOrderAmount || "",
    maxDiscount: coupon?.maxDiscount || "",
    usageLimit: coupon?.usageLimit?.toString() || "",
    isActive: coupon?.isActive ?? true,
    expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code,
        description: form.description || null,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderAmount: form.minOrderAmount || null,
        maxDiscount: form.maxDiscount || null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null,
      };
      if (coupon) {
        await apiRequest("PATCH", `/api/admin/coupons/${coupon.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/coupons", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: coupon ? "Coupon updated" : "Coupon created" });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.message?.includes("409") ? "A coupon with this code already exists" : "Failed to save coupon";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Coupon Code</Label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g., SAVE20" data-testid="input-coupon-code" />
        </div>
        <div>
          <Label>Discount Type</Label>
          <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
            <SelectTrigger data-testid="select-coupon-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (Rs.)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Discount Value</Label>
          <Input value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "percentage" ? "e.g., 20" : "e.g., 500"} type="number" data-testid="input-coupon-value" />
        </div>
        <div>
          <Label>Min Order Amount (Rs.)</Label>
          <Input value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="Optional" type="number" data-testid="input-coupon-min-order" />
        </div>
        <div>
          <Label>Max Discount (Rs.)</Label>
          <Input value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Optional" type="number" data-testid="input-coupon-max-discount" />
        </div>
        <div>
          <Label>Usage Limit</Label>
          <Input value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" type="number" data-testid="input-coupon-usage-limit" />
        </div>
        <div>
          <Label>Expiry Date</Label>
          <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} data-testid="input-coupon-expiry" />
        </div>
        <div className="flex items-center gap-2 self-end pb-1">
          <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} data-testid="switch-coupon-active" />
          <Label>Active</Label>
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Internal note about this coupon" data-testid="input-coupon-description" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.code || !form.discountValue} className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-save-coupon">
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {coupon ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminCoupons() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Coupon | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: allCoupons, isLoading } = useQuery<Coupon[]>({ queryKey: ["/api/admin/coupons"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/coupons/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/coupons/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });

  const filtered = allCoupons?.filter((c) =>
    !search || c.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-coupons-title">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">{allCoupons?.length || 0} total coupons</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-add-coupon">
              <Plus className="mr-1.5 h-4 w-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">{editing ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            </DialogHeader>
            <CouponForm coupon={editing} onClose={() => { setDialogOpen(false); setEditing(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search coupons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="input-search-coupons" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No coupons yet. Create your first coupon to offer discounts.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="hidden sm:table-cell">Min Order</TableHead>
                <TableHead className="hidden md:table-cell">Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
                return (
                  <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-mono font-bold text-sm">{coupon.code}</p>
                        {coupon.description && <p className="text-xs text-muted-foreground truncate max-w-[150px]">{coupon.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `Rs. ${Number(coupon.discountValue).toLocaleString("en-IN")}`}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {coupon.minOrderAmount ? `Rs. ${Number(coupon.minOrderAmount).toLocaleString("en-IN")}` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">
                        {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive && !isExpired && !isLimitReached}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: coupon.id, isActive: checked })}
                        disabled={!!isExpired || !!isLimitReached}
                        data-testid={`switch-coupon-toggle-${coupon.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(coupon); setDialogOpen(true); }} data-testid={`button-edit-coupon-${coupon.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(coupon.id)} data-testid={`button-delete-coupon-${coupon.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
