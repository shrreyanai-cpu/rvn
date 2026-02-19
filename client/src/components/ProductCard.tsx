import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  rating?: { average: number; count: number };
}

export default function ProductCard({ product, rating }: ProductCardProps) {
  const mainImage = product.images?.[0] || "/images/products/silk-saree-burgundy.png";
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <Card
        className="group cursor-pointer overflow-visible border-0 bg-transparent shadow-none"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
          <img
            src={mainImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-medium">
                Sold Out
              </Badge>
            </div>
          )}
          {hasDiscount && product.inStock && (
            <Badge
              className="absolute top-2 left-2 bg-[#C9A961] text-[#1A1A1A] border-0 text-[10px] font-semibold no-default-hover-elevate no-default-active-elevate"
            >
              -{discountPercent}%
            </Badge>
          )}
          {product.featured && product.inStock && !hasDiscount && (
            <Badge
              className="absolute top-2 left-2 bg-[#2C3E50] text-white border-0 text-[10px] font-semibold no-default-hover-elevate no-default-active-elevate"
            >
              Featured
            </Badge>
          )}
        </div>
        <div className="pt-3 space-y-1">
          <h3
            className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-[#C9A961] transition-colors"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
          {product.material && (
            <p className="text-xs text-muted-foreground">{product.material}</p>
          )}
          {rating && rating.count > 0 && (
            <div className="flex items-center gap-1" data-testid={`rating-${product.id}`}>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3 w-3 ${
                      s <= Math.round(rating.average)
                        ? "fill-[#C9A961] text-[#C9A961]"
                        : "fill-none text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">({rating.count})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" data-testid={`text-product-price-${product.id}`}>
              Rs. {Number(product.price).toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                Rs. {Number(product.compareAtPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
