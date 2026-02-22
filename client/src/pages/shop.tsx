import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { Search, X, ChevronRight, SlidersHorizontal, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

interface Filters {
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  brands: string[];
  materials: string[];
  inStockOnly: boolean;
}

const defaultFilters: Filters = {
  priceRange: [0, 100000],
  sizes: [],
  colors: [],
  brands: [],
  materials: [],
  inStockOnly: false,
};

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold uppercase tracking-wider text-foreground mb-2"
        data-testid={`filter-section-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange, count, testId }: { label: string; checked: boolean; onChange: (v: boolean) => void; count?: number; testId: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group" data-testid={testId}>
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </label>
  );
}

const COLOR_SWATCHES: Record<string, string> = {
  Red: "#DC2626", Blue: "#2563EB", Green: "#16A34A", Yellow: "#EAB308", Pink: "#EC4899",
  Purple: "#9333EA", Orange: "#EA580C", Black: "#1A1A1A", White: "#FAFAFA", Navy: "#1E3A5F",
  Maroon: "#800000", Gold: "#C9A961", Silver: "#C0C0C0", Beige: "#F5F5DC", Brown: "#8B4513",
  Cream: "#FFFDD0", Grey: "#808080", Gray: "#808080", Teal: "#008080", Coral: "#FF7F50",
  Magenta: "#FF00FF", Turquoise: "#40E0D0", Peach: "#FFDAB9", Lavender: "#E6E6FA",
  Ivory: "#FFFFF0", Rust: "#B7410E", Olive: "#808000", Mustard: "#FFDB58",
  "Sky Blue": "#87CEEB", "Royal Blue": "#4169E1", "Wine Red": "#722F37",
};

function FilterContent({
  filters, setFilters, allSizes, allColors, allBrands, allMaterials,
  priceMin, priceMax, products, onClearAll, activeFilterCount,
}: {
  filters: Filters; setFilters: (f: Filters) => void;
  allSizes: string[]; allColors: string[]; allBrands: string[]; allMaterials: string[];
  priceMin: number; priceMax: number; products: Product[];
  onClearAll: () => void; activeFilterCount: number;
}) {
  const toggleArrayFilter = useCallback((key: keyof Filters, value: string) => {
    const arr = filters[key] as string[];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    setFilters({ ...filters, [key]: next });
  }, [filters, setFilters]);

  const sizeCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products?.forEach(p => p.sizes?.forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return map;
  }, [products]);

  const colorCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products?.forEach(p => p.colors?.forEach(c => { map[c] = (map[c] || 0) + 1; }));
    return map;
  }, [products]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-lg font-bold" data-testid="text-filters-heading">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-7 text-[#C9A961]" data-testid="button-clear-all-filters">
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>
      <Separator />

      <FilterSection title="Price Range">
        <div className="px-1 pt-2">
          <Slider
            value={filters.priceRange}
            min={priceMin}
            max={priceMax}
            step={100}
            onValueChange={(val) => setFilters({ ...filters, priceRange: val as [number, number] })}
            data-testid="slider-price-range"
          />
          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const v = Math.max(priceMin, Math.min(Number(e.target.value), filters.priceRange[1]));
                  setFilters({ ...filters, priceRange: [v, filters.priceRange[1]] });
                }}
                className="h-8 text-xs"
                data-testid="input-price-min"
              />
            </div>
            <span className="text-muted-foreground text-xs mt-4">—</span>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const v = Math.min(priceMax, Math.max(Number(e.target.value), filters.priceRange[0]));
                  setFilters({ ...filters, priceRange: [filters.priceRange[0], v] });
                }}
                className="h-8 text-xs"
                data-testid="input-price-max"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            ₹{filters.priceRange[0].toLocaleString("en-IN")} — ₹{filters.priceRange[1].toLocaleString("en-IN")}
          </p>
        </div>
      </FilterSection>
      <Separator />

      {allSizes.length > 0 && (
        <>
          <FilterSection title="Size">
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleArrayFilter("sizes", size)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    filters.sizes.includes(size)
                      ? "bg-[#2C3E50] text-white border-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] dark:border-[#C9A961]"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                  data-testid={`filter-size-${size}`}
                >
                  {size} {sizeCountMap[size] ? `(${sizeCountMap[size]})` : ""}
                </button>
              ))}
            </div>
          </FilterSection>
          <Separator />
        </>
      )}

      {allColors.length > 0 && (
        <>
          <FilterSection title="Color">
            <div className="flex flex-wrap gap-2">
              {allColors.map(color => {
                const hex = COLOR_SWATCHES[color] || "#888";
                const isSelected = filters.colors.includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleArrayFilter("colors", color)}
                    className="flex flex-col items-center gap-1 group"
                    title={color}
                    data-testid={`filter-color-${color.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        isSelected ? "border-[#C9A961] ring-2 ring-[#C9A961]/30 scale-110" : "border-border group-hover:border-foreground"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[10px] text-muted-foreground leading-tight">{color}</span>
                    {colorCountMap[color] && <span className="text-[9px] text-muted-foreground">({colorCountMap[color]})</span>}
                  </button>
                );
              })}
            </div>
          </FilterSection>
          <Separator />
        </>
      )}

      {allBrands.length > 0 && (
        <>
          <FilterSection title="Brand" defaultOpen={false}>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allBrands.map(brand => (
                <FilterCheckbox
                  key={brand}
                  label={brand}
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleArrayFilter("brands", brand)}
                  testId={`filter-brand-${brand.toLowerCase().replace(/\s/g, '-')}`}
                />
              ))}
            </div>
          </FilterSection>
          <Separator />
        </>
      )}

      {allMaterials.length > 0 && (
        <>
          <FilterSection title="Material" defaultOpen={false}>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allMaterials.map(mat => (
                <FilterCheckbox
                  key={mat}
                  label={mat}
                  checked={filters.materials.includes(mat)}
                  onChange={() => toggleArrayFilter("materials", mat)}
                  testId={`filter-material-${mat.toLowerCase().replace(/\s/g, '-')}`}
                />
              ))}
            </div>
          </FilterSection>
          <Separator />
        </>
      )}

      <FilterSection title="Availability">
        <FilterCheckbox
          label="In Stock Only"
          checked={filters.inStockOnly}
          onChange={(v) => setFilters({ ...filters, inStockOnly: v as boolean })}
          testId="filter-in-stock"
        />
      </FilterSection>
    </div>
  );
}

export default function ShopPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") || "";
  const initialFeatured = params.get("featured") === "true";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const setCategoryAndUrl = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      navigate(`/shop?category=${slug}`, { replace: true });
    } else {
      navigate("/shop", { replace: true });
    }
  };

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const productIds = useMemo(() => products?.map(p => p.id) || [], [products]);
  const { data: ratingsMap } = useQuery<Record<number, { average: number; count: number }>>({
    queryKey: ["/api/products/ratings/batch", { ids: productIds.join(",") }],
    queryFn: async () => {
      if (productIds.length === 0) return {};
      const res = await fetch(`/api/products/ratings/batch?ids=${productIds.join(",")}`, { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: productIds.length > 0,
  });

  const { allSizes, allColors, allBrands, allMaterials, priceMin, priceMax } = useMemo(() => {
    if (!products) return { allSizes: [], allColors: [], allBrands: [], allMaterials: [], priceMin: 0, priceMax: 100000 };
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    const brandsSet = new Set<string>();
    const materialsSet = new Set<string>();
    let min = Infinity, max = 0;
    for (const p of products) {
      p.sizes?.forEach(s => sizesSet.add(s));
      p.colors?.forEach(c => colorsSet.add(c));
      if (p.brand) brandsSet.add(p.brand);
      if (p.material) materialsSet.add(p.material);
      const price = Number(p.price);
      if (price < min) min = price;
      if (price > max) max = price;
    }
    return {
      allSizes: Array.from(sizesSet).sort(),
      allColors: Array.from(colorsSet).sort(),
      allBrands: Array.from(brandsSet).sort(),
      allMaterials: Array.from(materialsSet).sort(),
      priceMin: Math.floor(min / 100) * 100,
      priceMax: Math.ceil(max / 100) * 100,
    };
  }, [products]);

  useEffect(() => {
    if (priceMin !== Infinity && priceMax !== 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [prev.priceRange[0] === 0 ? priceMin : prev.priceRange[0], prev.priceRange[1] === 100000 ? priceMax : prev.priceRange[1]],
      }));
    }
  }, [priceMin, priceMax]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > priceMin || filters.priceRange[1] < priceMax) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.materials.length > 0) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters, priceMin, priceMax]);

  const clearAllFilters = useCallback(() => {
    setFilters({ ...defaultFilters, priceRange: [priceMin, priceMax] });
  }, [priceMin, priceMax]);

  const mainCategories = useMemo(() => {
    return categories?.filter((c) => !c.parentId) || [];
  }, [categories]);

  const getSubcategories = (parentId: number) => {
    return (categories?.filter((c) => c.parentId === parentId) || []).sort((a, b) => a.name.localeCompare(b.name));
  };

  const selectedCat = categories?.find((c) => c.slug === selectedCategory);
  const isMainCategory = selectedCat && !selectedCat.parentId;
  const isSubCategory = selectedCat && selectedCat.parentId;

  const parentOfSelected = isSubCategory
    ? mainCategories.find((m) => m.id === selectedCat.parentId)
    : null;

  const visibleSubcategories = useMemo(() => {
    if (isMainCategory && selectedCat) {
      return getSubcategories(selectedCat.id);
    }
    if (isSubCategory && parentOfSelected) {
      return getSubcategories(parentOfSelected.id);
    }
    return [];
  }, [categories, selectedCat, isMainCategory, isSubCategory, parentOfSelected]);

  const filteredProducts = useMemo(() => {
    if (!products || !categories) return [];
    let filtered = [...products];

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        if (!cat.parentId) {
          const subIds = categories
            .filter((c) => c.parentId === cat.id)
            .map((c) => c.id);
          filtered = filtered.filter(
            (p) => p.categoryId === cat.id || subIds.includes(p.categoryId!)
          );
        } else {
          filtered = filtered.filter((p) => p.categoryId === cat.id);
        }
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
          p.material?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    const [minP, maxP] = filters.priceRange;
    if (minP > priceMin || maxP < priceMax) {
      filtered = filtered.filter(p => {
        const price = Number(p.price);
        return price >= minP && price <= maxP;
      });
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes?.some(s => filters.sizes.includes(s))
      );
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors?.some(c => filters.colors.includes(c))
      );
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(p =>
        p.brand && filters.brands.includes(p.brand)
      );
    }

    if (filters.materials.length > 0) {
      filtered = filtered.filter(p =>
        p.material && filters.materials.includes(p.material)
      );
    }

    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
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
      case "rating":
        filtered.sort((a, b) => {
          const rA = ratingsMap?.[a.id]?.average || 0;
          const rB = ratingsMap?.[b.id]?.average || 0;
          return rB - rA;
        });
        break;
      case "popularity":
        filtered.sort((a, b) => {
          const cA = ratingsMap?.[a.id]?.count || 0;
          const cB = ratingsMap?.[b.id]?.count || 0;
          return cB - cA;
        });
        break;
      case "discount":
        filtered.sort((a, b) => {
          const dA = a.compareAtPrice ? (Number(a.compareAtPrice) - Number(a.price)) / Number(a.compareAtPrice) : 0;
          const dB = b.compareAtPrice ? (Number(b.compareAtPrice) - Number(b.price)) / Number(b.compareAtPrice) : 0;
          return dB - dA;
        });
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return filtered;
  }, [products, categories, selectedCategory, searchQuery, sortBy, initialFeatured, filters, priceMin, priceMax, ratingsMap]);

  const pageTitle = selectedCat
    ? selectedCat.name
    : initialFeatured
      ? "Featured Collection"
      : "All Collections";
  const pageDescription = selectedCat?.description || "Discover our complete range of premium Indian clothing";

  const filterSidebarContent = (
    <FilterContent
      filters={filters}
      setFilters={setFilters}
      allSizes={allSizes}
      allColors={allColors}
      allBrands={allBrands}
      allMaterials={allMaterials}
      priceMin={priceMin}
      priceMax={priceMax}
      products={products || []}
      onClearAll={clearAllFilters}
      activeFilterCount={activeFilterCount}
    />
  );

  return (
    <div className="min-h-screen">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {(isSubCategory && parentOfSelected) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <button
                onClick={() => setCategoryAndUrl("")}
                className="hover:text-foreground transition-colors"
                data-testid="breadcrumb-all"
              >
                All
              </button>
              <ChevronRight className="h-3 w-3" />
              <button
                onClick={() => setCategoryAndUrl(parentOfSelected.slug)}
                className="hover:text-foreground transition-colors"
                data-testid="breadcrumb-parent"
              >
                {parentOfSelected.name}
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{selectedCat.name}</span>
            </div>
          )}
          {(isMainCategory && selectedCat) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <button
                onClick={() => setCategoryAndUrl("")}
                className="hover:text-foreground transition-colors"
                data-testid="breadcrumb-all"
              >
                All
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{selectedCat.name}</span>
            </div>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold" data-testid="text-shop-title">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {pageDescription}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? "default" : "secondary"}
              className={`cursor-pointer text-xs ${!selectedCategory ? "bg-[#2C3E50] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}`}
              onClick={() => setCategoryAndUrl("")}
              data-testid="badge-filter-all"
            >
              All
            </Badge>
            {mainCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.slug || (isSubCategory && parentOfSelected?.id === cat.id) ? "default" : "secondary"}
                className={`cursor-pointer text-xs ${selectedCategory === cat.slug || (isSubCategory && parentOfSelected?.id === cat.id) ? "bg-[#2C3E50] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}`}
                onClick={() => setCategoryAndUrl(selectedCategory === cat.slug ? "" : cat.slug)}
                data-testid={`badge-filter-${cat.slug}`}
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden relative" data-testid="button-mobile-filters">
                  <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-[#C9A961] text-white border-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-serif">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {filterSidebarContent}
                </div>
              </SheetContent>
            </Sheet>

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
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="discount">Biggest Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {visibleSubcategories.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-4 pl-1">
            <span className="text-xs text-muted-foreground mr-1">Subcategories:</span>
            {visibleSubcategories.map((sub) => (
              <Badge
                key={sub.id}
                variant={selectedCategory === sub.slug ? "default" : "outline"}
                className={`cursor-pointer text-xs ${selectedCategory === sub.slug ? "bg-[#C9A961] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}`}
                onClick={() => setCategoryAndUrl(selectedCategory === sub.slug ? (parentOfSelected?.slug || (isMainCategory ? selectedCat!.slug : "")) : sub.slug)}
                data-testid={`badge-sub-${sub.slug}`}
              >
                {sub.name}
              </Badge>
            ))}
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-4" data-testid="active-filters-bar">
            <span className="text-xs text-muted-foreground">Active:</span>
            {(filters.priceRange[0] > priceMin || filters.priceRange[1] < priceMax) && (
              <Badge variant="secondary" className="text-xs gap-1">
                ₹{filters.priceRange[0].toLocaleString("en-IN")} – ₹{filters.priceRange[1].toLocaleString("en-IN")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, priceRange: [priceMin, priceMax] })} />
              </Badge>
            )}
            {filters.sizes.map(s => (
              <Badge key={s} variant="secondary" className="text-xs gap-1">
                Size: {s}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, sizes: filters.sizes.filter(x => x !== s) })} />
              </Badge>
            ))}
            {filters.colors.map(c => (
              <Badge key={c} variant="secondary" className="text-xs gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_SWATCHES[c] || "#888" }} />
                {c}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, colors: filters.colors.filter(x => x !== c) })} />
              </Badge>
            ))}
            {filters.brands.map(b => (
              <Badge key={b} variant="secondary" className="text-xs gap-1">
                {b}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, brands: filters.brands.filter(x => x !== b) })} />
              </Badge>
            ))}
            {filters.materials.map(m => (
              <Badge key={m} variant="secondary" className="text-xs gap-1">
                {m}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, materials: filters.materials.filter(x => x !== m) })} />
              </Badge>
            ))}
            {filters.inStockOnly && (
              <Badge variant="secondary" className="text-xs gap-1">
                In Stock
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, inStockOnly: false })} />
              </Badge>
            )}
            <button onClick={clearAllFilters} className="text-xs text-[#C9A961] hover:underline ml-1" data-testid="button-clear-active-filters">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          <aside className="hidden lg:block w-60 shrink-0" data-testid="filter-sidebar">
            <div className="sticky top-20">
              {filterSidebarContent}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-product-count">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>

            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
                    setCategoryAndUrl("");
                    clearAllFilters();
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} rating={ratingsMap?.[product.id]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
