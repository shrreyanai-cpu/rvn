import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecentlyViewed } from "@/hooks/use-recently-viewed";
import type { Product } from "@shared/schema";

export default function RecentlyViewed() {
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useEffect(() => {
    setRecentIds(getRecentlyViewed());
  }, []);

  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: recentIds.length > 0,
  });

  if (recentIds.length === 0) return null;

  const recentProducts = recentIds
    .map((id) => allProducts?.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  if (!isLoading && recentProducts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16" data-testid="section-recently-viewed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
            Your History
          </p>
          <h2
            className="font-serif text-2xl sm:text-3xl font-bold"
            data-testid="text-recently-viewed-title"
          >
            Recently Viewed
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: Math.min(recentIds.length, 4) }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : recentProducts.map((product) => {
                const mainImage =
                  product.images?.[0] || "/images/products/silk-saree-burgundy.png";
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    data-testid={`link-recently-viewed-${product.id}`}
                  >
                    <Card className="group cursor-pointer overflow-visible border-0 bg-transparent shadow-none">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          data-testid={`img-recently-viewed-${product.id}`}
                        />
                      </div>
                      <div className="pt-3 space-y-1">
                        <h3
                          className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-[#C9A961] transition-colors"
                          data-testid={`text-recently-viewed-name-${product.id}`}
                        >
                          {product.name}
                        </h3>
                        <span
                          className="text-sm font-semibold block"
                          data-testid={`text-recently-viewed-price-${product.id}`}
                        >
                          Rs. {Number(product.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
