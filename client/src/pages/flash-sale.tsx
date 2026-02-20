import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import type { Product } from "@shared/schema";

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function CountdownTimer({ endTime }: { endTime: string | Date | null }) {
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!endTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (countdown.isExpired) {
    return (
      <div className="text-xs text-destructive font-semibold" data-testid="countdown-expired">
        Sale Ended
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 text-xs font-semibold text-[#C9A961]"
      data-testid="countdown-timer"
    >
      <Clock className="h-3 w-3" />
      <span>{String(countdown.hours).padStart(2, "0")}:</span>
      <span>{String(countdown.minutes).padStart(2, "0")}:</span>
      <span>{String(countdown.seconds).padStart(2, "0")}</span>
    </div>
  );
}

function FlashSaleProductCard({ product }: { product: Product }) {
  const mainImage = product.images?.[0] || "/images/products/silk-saree-burgundy.png";
  const hasFlashSale =
    product.flashSalePrice &&
    product.flashSaleStart &&
    product.flashSaleEnd &&
    Number(product.flashSalePrice) < Number(product.price);

  const discountPercent = hasFlashSale
    ? Math.round(
        ((Number(product.price) - Number(product.flashSalePrice)) / Number(product.price)) *
          100
      )
    : 0;

  return (
    <Card
      className="overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-sm hover-elevate"
      data-testid={`card-flash-sale-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          data-testid={`img-product-${product.id}`}
        />
        {hasFlashSale && discountPercent > 0 && (
          <Badge
            className="absolute top-3 left-3 bg-[#C9A961] text-[#1A1A1A] border-0 text-xs font-bold no-default-hover-elevate no-default-active-elevate"
            data-testid={`badge-discount-${product.id}`}
          >
            -{discountPercent}%
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        <div>
          <h3
            className="text-sm font-semibold text-[#2C3E50] dark:text-white line-clamp-2"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
          {product.material && (
            <p className="text-xs text-muted-foreground mt-1" data-testid={`text-material-${product.id}`}>
              {product.material}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          {product.flashSalePrice && (
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold text-[#C9A961]"
                data-testid={`text-flash-price-${product.id}`}
              >
                Rs. {Number(product.flashSalePrice).toLocaleString("en-IN")}
              </span>
              <span
                className="text-xs text-muted-foreground line-through"
                data-testid={`text-original-price-${product.id}`}
              >
                Rs. {Number(product.price).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <CountdownTimer endTime={product.flashSaleEnd} />
        </div>

        <Link href={`/product/${product.slug}`}>
          <Button
            className="w-full bg-[#2C3E50] hover:bg-[#1a2635] text-white"
            size="sm"
            data-testid={`button-shop-now-${product.id}`}
          >
            Shop Now
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function FlashSalePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/flash-sale"],
  });

  const [pageTitle] = useState("Flash Sale");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Banner */}
      <div
        className="relative bg-gradient-to-br from-[#2C3E50] to-[#1a2635] text-white overflow-hidden py-16 sm:py-20"
        data-testid="section-hero"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,169,97,0.2)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(201,169,97,0.2)_0%,transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-4 inline-block">
            <Badge
              className="bg-[#C9A961] text-[#1A1A1A] border-0 font-semibold text-xs"
              data-testid="badge-limited-time"
            >
              LIMITED TIME OFFER
            </Badge>
          </div>

          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-3"
            data-testid="heading-flash-sale"
          >
            {pageTitle}
          </h1>

          <p className="text-lg sm:text-xl text-[#C9A961] font-semibold mb-2" data-testid="text-hero-subtitle">
            Exclusive Deals On Premium Fashion
          </p>

          <p
            className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto"
            data-testid="text-hero-description"
          >
            Don't miss out on our biggest sale! Enjoy massive discounts on selected items for a limited time only.
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3" data-testid={`skeleton-card-${i}`}>
                <Skeleton className="aspect-[3/4] rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20" data-testid="section-no-sales">
            <div className="inline-block mb-4 p-3 bg-[#C9A961]/10 rounded-full">
              <Clock className="h-8 w-8 text-[#C9A961]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-white mb-2" data-testid="heading-no-sales">
              No Active Flash Sales Right Now
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto" data-testid="text-no-sales-description">
              Check back soon for amazing deals on our premium Indian fashion collection.
            </p>
            <Link href="/shop">
              <Button
                className="bg-[#2C3E50] hover:bg-[#1a2635] text-white"
                data-testid="button-shop-link"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-6" data-testid="text-product-count">
              {products.length} product{products.length !== 1 ? "s" : ""} on sale
            </p>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              data-testid="grid-flash-sale-products"
            >
              {products.map((product) => (
                <FlashSaleProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {products && products.length > 0 && (
        <div
          className="bg-gradient-to-br from-[#2C3E50] to-[#1a2635] text-white py-12 sm:py-16 text-center"
          data-testid="section-footer-cta"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3" data-testid="heading-footer-cta">
            Don't Wait! Sale Ends Soon
          </h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto" data-testid="text-footer-description">
            Get your favorite items before they're gone. Limited stock available.
          </p>
        </div>
      )}
    </div>
  );
}
