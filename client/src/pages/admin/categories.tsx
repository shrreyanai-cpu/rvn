import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, ImageIcon, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import type { Category } from "@shared/schema";

function CategoryForm({ category, categories, onClose }: { category?: Category; categories?: Category[]; onClose: () => void }) {
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload({});
  const mainCategories = categories?.filter((c) => !c.parentId && c.id !== category?.id) || [];

  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    imageUrl: category?.imageUrl || "",
    parentId: category?.parentId ? String(category.parentId) : "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        parentId: form.parentId ? Number(form.parentId) : null,
      };
      if (category) {
        await apiRequest("PATCH", `/api/admin/categories/${category.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/categories", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: category ? "Category updated" : "Category created" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadFile(file);
    if (result) setForm({ ...form, imageUrl: result.objectPath });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Parent Category</Label>
        <Select value={form.parentId} onValueChange={(val) => setForm({ ...form, parentId: val === "none" ? "" : val })}>
          <SelectTrigger data-testid="select-parent-category">
            <SelectValue placeholder="None (Main Category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Main Category)</SelectItem>
            {mainCategories.map((mc) => (
              <SelectItem key={mc.id} value={String(mc.id)}>{mc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Category Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" data-testid="input-category-name" />
      </div>
      <div>
        <Label>Slug</Label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated from name" data-testid="input-category-slug" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Category description" data-testid="input-category-description" />
      </div>
      <div>
        <Label>Image</Label>
        <div className="flex items-center gap-3 mt-2">
          {form.imageUrl ? (
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
              <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setForm({ ...form, imageUrl: "" })} className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5">
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ) : (
            <label className="w-16 h-16 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover-elevate">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
            </label>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-save-category">
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {category ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Category | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories, isLoading } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const mainCategories = useMemo(() => categories?.filter((c) => !c.parentId) || [], [categories]);
  const getSubcategories = (parentId: number) => categories?.filter((c) => c.parentId === parentId) || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/categories/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted" });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-categories-title">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mainCategories.length} main categories, {(categories?.length || 0) - mainCategories.length} subcategories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-add-category">
              <Plus className="mr-1.5 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">{editing ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <CategoryForm category={editing} categories={categories} onClose={() => { setDialogOpen(false); setEditing(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
      ) : (
        <div className="space-y-6">
          {mainCategories.map((main) => {
            const subs = getSubcategories(main.id);
            return (
              <Card key={main.id} className="overflow-hidden" data-testid={`card-main-category-${main.id}`}>
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {main.imageUrl && (
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img src={main.imageUrl} alt={main.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{main.name}</h3>
                      <p className="text-xs text-muted-foreground">{subs.length} subcategories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(main); setDialogOpen(true); }} data-testid={`button-edit-category-${main.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                      if (subs.length > 0) {
                        toast({ title: "Cannot delete", description: "Remove all subcategories first", variant: "destructive" });
                        return;
                      }
                      deleteMutation.mutate(main.id);
                    }} data-testid={`button-delete-category-${main.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {subs.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-8">Subcategory</TableHead>
                        <TableHead className="hidden sm:table-cell">Slug</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subs.map((sub) => (
                        <TableRow key={sub.id} data-testid={`row-category-${sub.id}`}>
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm">{sub.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">{sub.slug}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => { setEditing(sub); setDialogOpen(true); }} data-testid={`button-edit-category-${sub.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(sub.id)} data-testid={`button-delete-category-${sub.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
