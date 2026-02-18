import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") || "";
  const initialFeatured = params.get("featured") === "true";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = [...products];

    if (selectedCategory) {
      const cat = categories?.find((c) => c.slug === selectedCategory);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    if (initialFeatured) {
      filtered = filtered.filter((p) => p.featured);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return filtered;
  }, [products, categories, selectedCategory, searchQuery, sortBy, initialFeatured]);

  const activeCategory = categories?.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold" data-testid="text-shop-title">
            {activeCategory ? activeCategory.name : initialFeatured ? "Featured Collection" : "All Collections"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {activeCategory?.description || "Discover our complete range of premium Indian clothing"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? "default" : "secondary"}
              className={`cursor-pointer text-xs ${!selectedCategory ? "bg-[#2C3E50] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}`}
              onClick={() => setSelectedCategory("")}
              data-testid="badge-filter-all"
            >
              All
            </Badge>
            {categories?.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.slug ? "default" : "secondary"}
                className={`cursor-pointer text-xs ${selectedCategory === cat.slug ? "bg-[#2C3E50] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}`}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)}
                data-testid={`badge-filter-${cat.slug}`}
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6" data-testid="text-product-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </p>

        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">No products found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
