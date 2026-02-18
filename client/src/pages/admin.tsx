import { useState } from "react";
import { Link } from "wouter";
import {
  Package, ShoppingBag, Users, BarChart3, Plus, Pencil, Trash2,
  ArrowLeft, Loader2, ImageIcon, X, Clock, Truck, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Product, Category, Order, OrderItem } from "@shared/schema";

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
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Product name"
            data-testid="input-product-name"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="Auto-generated from name"
            data-testid="input-product-slug"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Product description"
            data-testid="input-product-description"
          />
        </div>
        <div>
          <Label>Price (Rs.)</Label>
          <Input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00"
            type="number"
            data-testid="input-product-price"
          />
        </div>
        <div>
          <Label>Compare at Price (Rs.)</Label>
          <Input
            value={form.compareAtPrice}
            onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
            placeholder="0.00"
            type="number"
            data-testid="input-product-compare-price"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
            <SelectTrigger data-testid="select-product-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Material</Label>
          <Input
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            placeholder="e.g., Pure Silk"
            data-testid="input-product-material"
          />
        </div>
        <div>
          <Label>Sizes (comma separated)</Label>
          <Input
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            placeholder="S, M, L, XL"
            data-testid="input-product-sizes"
          />
        </div>
        <div>
          <Label>Colors (comma separated)</Label>
          <Input
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            placeholder="Red, Blue, Green"
            data-testid="input-product-colors"
          />
        </div>
        <div>
          <Label>Stock Quantity</Label>
          <Input
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            type="number"
            data-testid="input-product-stock"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.inStock}
              onCheckedChange={(c) => setForm({ ...form, inStock: c })}
              data-testid="switch-in-stock"
            />
            <Label>In Stock</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.featured}
              onCheckedChange={(c) => setForm({ ...form, featured: c })}
              data-testid="switch-featured"
            />
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
              <button
                onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          <label className="w-16 h-20 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover-elevate">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.name || !form.price}
          className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
          data-testid="button-save-product"
        >
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: orders, isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order updated" });
    },
  });

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0) || 0;
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    processing: { label: "Processing", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    delivered: { label: "Delivered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2" data-testid="button-admin-back">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Store
            </Button>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A961]/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-[#C9A961]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold" data-testid="text-total-revenue">
                Rs. {totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-lg font-bold" data-testid="text-total-products">{totalProducts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold" data-testid="text-total-orders">{totalOrders}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="mr-1.5 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <ShoppingBag className="mr-1.5 h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold">Products ({totalProducts})</h2>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingProduct(undefined);
            }}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                  data-testid="button-add-product"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  product={editingProduct}
                  categories={categories || []}
                  onClose={() => {
                    setDialogOpen(false);
                    setEditingProduct(undefined);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {loadingProducts ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
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
                  {products?.map((product) => {
                    const cat = categories?.find((c) => c.id === product.categoryId);
                    return (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={product.images?.[0] || "/images/products/silk-saree-burgundy.png"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm truncate max-w-[150px]">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.material}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{cat?.name || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">Rs. {Number(product.price).toLocaleString("en-IN")}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{product.stockQuantity}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={product.inStock ? "default" : "secondary"}
                            className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${
                              product.inStock
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            } border-0`}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingProduct(product);
                                setDialogOpen(true);
                              }}
                              data-testid={`button-edit-product-${product.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(product.id)}
                              data-testid={`button-delete-product-${product.id}`}
                            >
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
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="font-semibold mb-4">Orders ({totalOrders})</h2>
          {loadingOrders ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No orders yet</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const items = (order.items as OrderItem[]) || [];
                    const sc = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">#{order.id}</p>
                            <p className="text-xs text-muted-foreground">{items.length} items</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.createdAt!).toLocaleDateString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            Rs. {Number(order.totalAmount).toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] border-0 no-default-hover-elevate no-default-active-elevate ${sc.className}`}
                          >
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              updateOrderMutation.mutate({ id: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
