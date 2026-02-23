import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

interface WishlistItem {
  id: number;
  productId: number;
  product: Product;
}

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: wishlistItems, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest("DELETE", `/api/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Removed from wishlist" });
    },
    onError: () => {
      toast({ title: "Failed to remove item", variant: "destructive" });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest("POST", "/api/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart" });
    },
    onError: () => {
      toast({ title: "Failed to add to cart", variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1
          className="font-serif text-2xl font-bold text-[#2C3E50] dark:text-white mb-2"
          data-testid="text-wishlist-login-title"
        >
          Sign in to view your wishlist
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Save your favorite items and come back to them anytime.
        </p>
        <Link href="/login">
          <Button
            className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
            data-testid="button-wishlist-login"
          >
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1
            className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E50] dark:text-white"
            data-testid="text-wishlist-title"
          >
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {wishlistItems?.length
              ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} saved`
              : "Your saved favorites"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !wishlistItems || wishlistItems.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20"
            data-testid="wishlist-empty-state"
          >
            <Heart className="h-20 w-20 text-muted-foreground/20 mb-6" />
            <h2 className="font-serif text-xl font-semibold text-[#2C3E50] dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">
              Browse our collections and tap the heart icon on items you love to
              save them here.
            </p>
            <Link href="/shop">
              <Button
                className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961]"
                data-testid="button-wishlist-browse"
              >
                Browse Collections
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const mainImage =
                product.images?.[0] ||
                "/images/products/silk-saree-burgundy.png";
              const hasDiscount =
                product.compareAtPrice &&
                Number(product.compareAtPrice) > Number(product.price);

              return (
                <div
                  key={item.id}
                  className="group"
                  data-testid={`wishlist-item-${product.id}`}
                >
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted cursor-pointer">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          removeMutation.mutate(product.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-black/60 text-red-500 hover:bg-white dark:hover:bg-black/80 transition-colors z-10"
                        data-testid={`button-wishlist-remove-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Link>
                  <div className="pt-3 space-y-1.5">
                    <Link href={`/product/${product.slug}`}>
                      <h3
                        className="text-sm font-medium leading-snug line-clamp-1 hover:text-[#C9A961] transition-colors cursor-pointer"
                        data-testid={`text-wishlist-product-name-${product.id}`}
                      >
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        data-testid={`text-wishlist-product-price-${product.id}`}
                      >
                        Rs. {Number(product.price).toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          Rs.{" "}
                          {Number(product.compareAtPrice).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-1 bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] text-xs"
                      onClick={() => addToCartMutation.mutate(product.id)}
                      disabled={!product.inStock || addToCartMutation.isPending}
                      data-testid={`button-wishlist-add-to-cart-${product.id}`}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
