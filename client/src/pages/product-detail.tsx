import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, ShoppingBag, Minus, Plus, Check, Zap, Star, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Product, Review } from "@shared/schema";

function StarRating({ rating, size = "sm", interactive = false, onRate }: { rating: number; size?: "sm" | "md" | "lg"; interactive?: boolean; onRate?: (r: number) => void }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          data-testid={`star-${star}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? "fill-[#C9A961] text-[#C9A961]"
                : "fill-none text-muted-foreground/40"
            } ${interactive ? "transition-colors" : ""}`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ productId, isAuthenticated, userId }: { productId: number; isAuthenticated: boolean; userId?: string }) {
  const { toast } = useToast();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const { data: reviewData, isLoading: reviewsLoading } = useQuery<{
    reviews: (Review & { userName: string })[];
    average: number;
    count: number;
  }>({
    queryKey: ["/api/products", productId, "reviews"],
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/products/${productId}/reviews`, {
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Could not submit review.", variant: "destructive" });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      toast({ title: "Review deleted" });
    },
  });

  const reviews = reviewData?.reviews || [];
  const average = reviewData?.average || 0;
  const count = reviewData?.count || 0;
  const hasUserReviewed = reviews.some((r) => r.userId === userId);

  return (
    <div className="mt-12 max-w-4xl" data-testid="section-reviews">
      <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6">Customer Reviews</h2>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold" data-testid="text-average-rating">
            {count > 0 ? average.toFixed(1) : "--"}
          </span>
          <div>
            <StarRating rating={Math.round(average)} size="md" />
            <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-review-count">
              {count} {count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {count > 0 && (
          <div className="flex-1 min-w-[200px] max-w-xs space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const starCount = reviews.filter((r) => r.rating === star).length;
              const pct = count > 0 ? (starCount / count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 fill-[#C9A961] text-[#C9A961]" />
                  <div className="flex-1 h-2 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-[#C9A961] rounded-md transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground text-xs">{starCount}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isAuthenticated && !hasUserReviewed && (
        <Card className="p-5 mb-8">
          <h3 className="font-medium mb-3">Write a Review</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Your Rating</p>
              <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
            </div>
            <Input
              placeholder="Review title (optional)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={200}
              data-testid="input-review-title"
            />
            <Textarea
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              maxLength={2000}
              className="resize-none"
              rows={4}
              data-testid="input-review-comment"
            />
            <Button
              onClick={() => submitReview.mutate()}
              disabled={reviewRating === 0 || submitReview.isPending}
              className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
              data-testid="button-submit-review"
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </Card>
      )}

      {!isAuthenticated && (
        <Card className="p-5 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Sign in to leave a review</p>
          <Link href="/login">
            <Button variant="outline" size="sm" data-testid="button-login-review">Sign In</Button>
          </Link>
        </Card>
      )}

      {reviewsLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0" data-testid={`review-item-${review.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium" data-testid={`text-reviewer-${review.id}`}>{review.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  {review.userId === userId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteReview.mutate(review.id)}
                      disabled={deleteReview.isPending}
                      data-testid={`button-delete-review-${review.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
              {review.title && (
                <p className="font-medium text-sm mb-0.5" data-testid={`text-review-title-${review.id}`}>{review.title}</p>
              )}
              {review.comment && (
                <p className="text-sm text-muted-foreground" data-testid={`text-review-comment-${review.id}`}>{review.comment}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug;
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { user } = useAuth();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product!.id,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart", description: `${product!.name} has been added to your cart.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not add to cart. Please sign in first.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-6 w-24 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-[3/4] rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found</p>
        <Link href="/shop">
          <Button variant="outline" className="mt-4" data-testid="button-back-to-shop">
            Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/images/products/silk-saree-burgundy.png"];
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/shop">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Shop
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="img-product-main"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i ? "border-[#C9A961]" : "border-transparent"
                  }`}
                  data-testid={`button-thumbnail-${i}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {product.material && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.material}</p>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-product-title">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-semibold" data-testid="text-product-price">
                Rs. {Number(product.price).toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    Rs. {Number(product.compareAtPrice).toLocaleString("en-IN")}
                  </span>
                  <Badge className="bg-[#C9A961] text-[#1A1A1A] border-0 no-default-hover-elevate no-default-active-elevate text-xs">
                    Save {Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}%
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-product-description">
              {product.description}
            </p>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? "bg-[#2C3E50] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                    className={selectedColor === color ? "bg-[#2C3E50] text-white dark:bg-[#C9A961] dark:text-[#1A1A1A]" : ""}
                    data-testid={`button-color-${color}`}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                data-testid="button-quantity-minus"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium" data-testid="text-quantity">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-quantity-plus"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
              disabled={!product.inStock || addToCartMutation.isPending}
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = "/login";
                  return;
                }
                addToCartMutation.mutate();
              }}
              data-testid="button-add-to-cart"
            >
              {addToCartMutation.isPending ? (
                "Adding..."
              ) : !product.inStock ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#C9A961] text-[#C9A961] font-semibold"
              disabled={!product.inStock}
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = "/login";
                  return;
                }
                const params = new URLSearchParams();
                params.set("productId", String(product.id));
                params.set("quantity", String(quantity));
                if (selectedSize) params.set("size", selectedSize);
                if (selectedColor) params.set("color", selectedColor);
                navigate(`/checkout?buyNow=true&${params.toString()}`);
              }}
              data-testid="button-buy-now"
            >
              <Zap className="mr-2 h-4 w-4" />
              Buy Now
            </Button>
          </div>

          {product.inStock && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3.5 w-3.5" />
              <span data-testid="text-stock-status">In Stock ({product.stockQuantity} available)</span>
            </div>
          )}
        </div>
      </div>

      <Separator className="mt-10" />

      <ReviewSection
        productId={product.id}
        isAuthenticated={isAuthenticated}
        userId={user?.id}
      />
    </div>
  );
}
