import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search as SearchIcon, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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

  const results = query.length >= 2
    ? products?.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.material?.toLowerCase().includes(query.toLowerCase())
      ) || []
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-search">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </Link>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for sarees, kurtas, lehengas..."
          className="pl-12 h-12 text-base"
          autoFocus
          data-testid="input-search-main"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {query.length < 2 ? (
        <div className="text-center py-16">
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Type at least 2 characters to search</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-1">No results found</p>
          <p className="text-muted-foreground text-sm">Try a different search term</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-search-count">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} rating={ratingsMap?.[product.id]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
