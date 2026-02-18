import { useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, ImageIcon, X, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import type { Product, Category } from "@shared/schema";

function ProductForm({
  product,
  categories,
  onClose,
}: {
  product?: Product;
  categories: Category[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload({});

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || "",
    compareAtPrice: product?.compareAtPrice || "",
    categoryId: product?.categoryId?.toString() || "",
    material: product?.material || "",
    sizes: product?.sizes?.join(", ") || "",
    colors: product?.colors?.join(", ") || "",
    stockQuantity: product?.stockQuantity?.toString() || "0",
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    images: product?.images || [] as string[],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: form.description,
        price: form.price,
        compareAtPrice: form.compareAtPrice || null,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        material: form.material || null,
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
        stockQuantity: parseInt(form.stockQuantity) || 0,
        inStock: form.inStock,
        featured: form.featured,
        images: form.images,
      };
      if (product) {
        await apiRequest("PATCH", `/api/admin/products/${product.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/products", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: product ? "Product updated" : "Product created" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadFile(file);
    if (result) {
      setForm({ ...form, images: [...form.images, result.objectPath] });
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Product Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" data-testid="input-product-name" />
        </div>
        <div className="sm:col-span-2">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated from name" data-testid="input-product-slug" />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" data-testid="input-product-description" />
        </div>
        <div>
          <Label>Price (Rs.)</Label>
          <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" type="number" data-testid="input-product-price" />
        </div>
        <div>
          <Label>Compare at Price (Rs.)</Label>
          <Input value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} placeholder="0.00" type="number" data-testid="input-product-compare-price" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
            <SelectTrigger data-testid="select-product-category"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Material</Label>
          <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g., Pure Silk" data-testid="input-product-material" />
        </div>
        <div>
          <Label>Sizes (comma separated)</Label>
          <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" data-testid="input-product-sizes" />
        </div>
        <div>
          <Label>Colors (comma separated)</Label>
          <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Red, Blue, Green" data-testid="input-product-colors" />
        </div>
        <div>
          <Label>Stock Quantity</Label>
          <Input value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} type="number" data-testid="input-product-stock" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={form.inStock} onCheckedChange={(c) => setForm({ ...form, inStock: c })} data-testid="switch-in-stock" />
            <Label>In Stock</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} data-testid="switch-featured" />
            <Label>Featured</Label>
          </div>
        </div>
      </div>
      <div>
        <Label>Product Images</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-16 h-20 rounded-md overflow-hidden bg-muted">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5">
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          <label className="w-16 h-20 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover-elevate">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.price} className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-save-product">
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/admin/products"] });
  const { data: categories } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/products/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
    },
  });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-products-title">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products?.length || 0} total products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProduct(undefined); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-add-product">
              <Plus className="mr-1.5 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm product={editingProduct} categories={categories || []} onClose={() => { setDialogOpen(false); setEditingProduct(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="input-search-products" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const cat = categories?.find((c) => c.id === product.categoryId);
                return (
                  <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img src={product.images?.[0] || "/images/products/silk-saree-burgundy.png"} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[180px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.material}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><span className="text-sm text-muted-foreground">{cat?.name || "-"}</span></TableCell>
                    <TableCell><span className="text-sm font-medium">Rs. {Number(product.price).toLocaleString("en-IN")}</span></TableCell>
                    <TableCell className="hidden md:table-cell"><span className="text-sm">{product.stockQuantity}</span></TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={product.inStock ? "default" : "secondary"} className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${product.inStock ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"} border-0`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingProduct(product); setDialogOpen(true); }} data-testid={`button-edit-product-${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(product.id)} data-testid={`button-delete-product-${product.id}`}>
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
