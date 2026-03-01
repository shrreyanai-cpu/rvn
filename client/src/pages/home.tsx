import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, Truck, Shield, Repeat, Sparkles, Star, Quote, Award, Users, MapPin, Clock, TrendingUp } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Category, SeasonalBanner } from "@shared/schema";
import ProductCard from "@/components/ProductCard";
import InstagramFeed from "@/components/instagram-feed";
import RecentlyViewed from "@/components/recently-viewed";
import SEOHead from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

const heroSlides = [
  {
    image: "/images/hero-banner.png",
    subtitle: "Premium Indian Fashion Since 1985",
    title: "Timeless Elegance,",
    highlight: "Modern Grace",
    description: "Discover exquisite handcrafted clothing that celebrates India's rich textile heritage with contemporary sophistication.",
    cta: { text: "Shop Collection", href: "/shop" },
    secondary: { text: "View Featured", href: "/shop?featured=true" },
  },
  {
    image: "/images/products/red-bridal-lehenga.png",
    subtitle: "Bridal Season 2026",
    title: "The Grand",
    highlight: "Bridal Collection",
    description: "Exquisite bridal lehengas featuring heavy kundan and zardozi embroidery, crafted for the modern Indian bride.",
    cta: { text: "Shop Bridal", href: "/shop?category=lehenga" },
    secondary: { text: "Explore More", href: "/shop" },
  },
  {
    image: "/images/products/silk-saree-burgundy.png",
    subtitle: "Handwoven Heritage",
    title: "Pure Silk",
    highlight: "Saree Collection",
    description: "Handwoven by master artisans from Varanasi and Kanchipuram, each saree tells a story of centuries-old craftsmanship.",
    cta: { text: "Shop Sarees", href: "/shop?category=sarees" },
    secondary: { text: "All Collections", href: "/shop" },
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrent(index);
    resetAutoSlide();
  }, [resetAutoSlide]);

  useEffect(() => {
    resetAutoSlide();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetAutoSlide]);

  const slide = heroSlides[current];

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
      {heroSlides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt={`${s.title} ${s.highlight}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        </div>
      ))}
      <div className="absolute inset-x-0 top-16 bottom-16 z-10 flex items-center pointer-events-none">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pointer-events-auto">
          <div className="max-w-xl">
            <p
              className="text-[#C9A961] text-xs sm:text-sm font-medium tracking-[0.3em] uppercase mb-5 transition-opacity duration-500"
              key={`subtitle-${current}`}
              data-testid={`text-hero-subtitle-${current}`}
            >
              {slide.subtitle}
            </p>
            <div className="w-12 h-[2px] bg-[#C9A961] mb-6" />
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5 transition-opacity duration-500"
              key={`title-${current}`}
              data-testid={`text-hero-title-${current}`}
            >
              {slide.title}{" "}
              <span className="text-[#C9A961] italic">{slide.highlight}</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-md transition-opacity duration-500" key={`desc-${current}`}>
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={slide.cta.href}>
                <Button
                  className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] font-semibold px-8 tracking-wide"
                  data-testid={`button-hero-cta-${current}`}
                >
                  {slide.cta.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={slide.secondary.href}>
                <Button
                  variant="outline"
                  className="text-white border-white/25 backdrop-blur-sm bg-white/5 px-8 tracking-wide"
                  data-testid={`button-hero-secondary-${current}`}
                >
                  {slide.secondary.text}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="p-2 cursor-pointer"
            aria-label={`Go to slide ${i + 1}`}
            data-testid={`button-hero-dot-${i}`}
          >
            <span className={`block rounded-full transition-all duration-500 ${
              i === current ? "w-6 h-1 bg-[#C9A961]" : "w-3 h-1 bg-white/40"
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const { data: featuredProducts, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products?featured=true"],
  });

  const { data: allProducts, isLoading: loadingAll } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: bestSelling, isLoading: loadingBest } = useQuery<Product[]>({
    queryKey: ["/api/products/best-selling"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: banners } = useQuery<SeasonalBanner[]>({
    queryKey: ["/api/banners"],
  });

  const { data: wishlistItems } = useQuery<{ productId: number }[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const wishlistedIds = useMemo(() => new Set(wishlistItems?.map(w => w.productId) || []), [wishlistItems]);

  const addToWishlist = useMutation({
    mutationFn: (productId: number) => apiRequest("POST", "/api/wishlist", { productId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
  });

  const removeFromWishlist = useMutation({
    mutationFn: (productId: number) => apiRequest("DELETE", `/api/wishlist/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
  });

  const handleWishlistToggle = useCallback((productId: number) => {
    if (!isAuthenticated) return;
    if (wishlistedIds.has(productId)) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId);
    }
  }, [isAuthenticated, wishlistedIds, addToWishlist, removeFromWishlist]);

  const allIds = useMemo(() => {
    const ids = new Set<number>();
    allProducts?.forEach(p => ids.add(p.id));
    featuredProducts?.forEach(p => ids.add(p.id));
    bestSelling?.forEach(p => ids.add(p.id));
    return Array.from(ids);
  }, [allProducts, featuredProducts, bestSelling]);

  const { data: ratingsMap } = useQuery<Record<number, { average: number; count: number }>>({
    queryKey: ["/api/products/ratings/batch", { ids: allIds.join(",") }],
    queryFn: async () => {
      if (allIds.length === 0) return {};
      const res = await fetch(`/api/products/ratings/batch?ids=${allIds.join(",")}`, { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: allIds.length > 0,
  });

  const mainCategories = categories?.filter((c) => !c.parentId) || [];
  const getSubcategories = (parentId: number) => categories?.filter((c) => c.parentId === parentId) || [];
  const newArrivals = useMemo(() => {
    if (!allProducts) return [];
    return [...allProducts]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [allProducts]);

  const collectionImages: Record<string, string> = {
    "sarees": "/images/products/silk-saree-burgundy.png",
    "mens-wear": "/images/products/navy-kurta-set.png",
    "womens-wear": "/images/products/emerald-lehenga.png",
    "kids-wear": "/images/products/cream-sherwani.png",
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Premium Indian Fashion"
        description="Discover exquisite handcrafted Indian clothing at Ravindrra Vastra Niketan. Shop sarees, lehengas, kurtas, sherwanis and more with free shipping above Rs. 1,000."
        keywords="Indian fashion, sarees, lehengas, kurtas, sherwanis, ethnic wear, handcrafted clothing, Raipur"
        ogType="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Ravindrra Vastra Niketan",
          "description": "Premium Indian Fashion Since 1985. Handcrafted clothing celebrating India's rich textile heritage.",
          "url": window.location.origin,
          "logo": `${window.location.origin}/logo.png`,
        }}
      />
      <HeroSlider />

      {banners && banners.length > 0 && (
        <section className="py-6 sm:py-8 bg-gradient-to-r from-[#C9A961]/10 via-transparent to-[#C9A961]/10" data-testid="section-seasonal-banners">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className={`grid gap-4 ${banners.length === 1 ? 'grid-cols-1' : banners.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {banners.map((banner) => (
                <Link key={banner.id} href={banner.linkUrl || "/shop"}>
                  <div className="group relative overflow-hidden rounded-lg cursor-pointer" data-testid={`banner-seasonal-${banner.id}`}>
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-[#2C3E50] to-[#1a2530] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <div className="text-center px-6">
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">{banner.title}</h3>
                          {banner.subtitle && <p className="text-white/70 text-sm">{banner.subtitle}</p>}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-lg font-bold text-white">{banner.title}</h3>
                      {banner.subtitle && <p className="text-white/80 text-xs mt-0.5">{banner.subtitle}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative z-20 overflow-hidden bg-[#2C3E50] dark:bg-[#1a2530] py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex items-center shrink-0">
              {[
                "Handcrafted with Love",
                "Free Shipping Above Rs. 1,000",
                "Premium Quality Fabrics",
                "2-Day Easy Returns",
                "Authentic Indian Craftsmanship",
                "Secure Payments",
              ].map((text) => (
                <span key={`${idx}-${text}`} className="flex items-center mx-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] mr-4 shrink-0" />
                  <span className="text-white/80 text-xs sm:text-sm font-medium tracking-wider uppercase">
                    {text}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div>
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Just In
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-new-arrivals-title">
                New Arrivals
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                The latest additions to our collection, fresh from our artisan workshops
              </p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" size="sm" data-testid="link-view-all-new-arrivals">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loadingAll
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} rating={ratingsMap?.[product.id]} isWishlisted={wishlistedIds.has(product.id)} onWishlistToggle={isAuthenticated ? handleWishlistToggle : undefined} />
                ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div>
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Explore
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-categories-title">
                Shop by Category
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                From elegant sarees to regal sherwanis, find the perfect outfit for every occasion
              </p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" size="sm" data-testid="link-view-all-categories">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {loadingCategories
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-md" />
                ))
              : mainCategories.map((cat) => (
                  <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
                    <div
                      className="group relative aspect-[3/4] overflow-hidden rounded-md cursor-pointer"
                      data-testid={`card-category-${cat.id}`}
                    >
                      {(cat.imageUrl || collectionImages[cat.slug]) && (
                        <img
                          src={cat.imageUrl || collectionImages[cat.slug]}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/80" />
                      <div className="absolute inset-0 border border-white/0 group-hover:border-[#C9A961]/50 rounded-md transition-all duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-serif text-white text-lg font-semibold mb-1">{cat.name}</h3>
                        <p className="text-white/60 text-xs mb-1">{getSubcategories(cat.id).length} subcategories</p>
                        <span className="text-white/0 group-hover:text-white/80 text-xs font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-1" data-testid={`link-shop-now-${cat.slug}`}>
                          Shop Now <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div>
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                <TrendingUp className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                Most Popular
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-bestselling-title">
                Best Selling
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                Our customers' favorites - the most loved pieces from our collection
              </p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" size="sm" data-testid="link-view-all-bestselling">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loadingBest
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : (bestSelling || []).slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} rating={ratingsMap?.[product.id]} isWishlisted={wishlistedIds.has(product.id)} onWishlistToggle={isAuthenticated ? handleWishlistToggle : undefined} />
                ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#2C3E50] dark:bg-[#1a2530]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              Browse
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white" data-testid="text-collections-title">
              Our Collections
            </h2>
            <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
              Explore our curated collections across every category
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {loadingCategories
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-md bg-white/10" />
                ))
              : mainCategories.flatMap((main) => 
                  getSubcategories(main.id).slice(0, 3).map((sub) => (
                    <Link key={sub.id} href={`/shop?category=${sub.slug}`}>
                      <div
                        className="group flex items-center gap-3 p-3 sm:p-4 rounded-md bg-white/5 border border-white/10 hover:border-[#C9A961]/40 hover:bg-white/10 transition-all cursor-pointer"
                        data-testid={`card-collection-${sub.id}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#C9A961]/15 flex items-center justify-center shrink-0">
                          <Sparkles className="h-4 w-4 text-[#C9A961]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white text-sm font-medium truncate group-hover:text-[#C9A961] transition-colors">
                            {sub.name}
                          </h3>
                          <p className="text-white/40 text-[11px]">
                            {mainCategories.find((m) => m.id === sub.parentId)?.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
          </div>
          <div className="text-center mt-8">
            <Link href="/shop">
              <Button
                variant="outline"
                className="text-white border-white/25 bg-white/5 tracking-wide"
                data-testid="link-view-all-collections"
              >
                View All Collections <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div>
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Curated for You
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-featured-title">
                Featured Collection
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                Hand-picked pieces from our finest collections, chosen for their exceptional quality and design
              </p>
            </div>
            <Link href="/shop?featured=true">
              <Button variant="ghost" size="sm" data-testid="link-view-all-featured">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loadingProducts
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : featuredProducts?.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} rating={ratingsMap?.[product.id]} isWishlisted={wishlistedIds.has(product.id)} onWishlistToggle={isAuthenticated ? handleWishlistToggle : undefined} />
                ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-md overflow-hidden">
              <img
                src="/images/products/red-bridal-lehenga.png"
                alt="The Bridal Collection"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="bg-[#C9A961] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  Bestseller
                </span>
              </div>
            </div>
            <div className="lg:pl-8">
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.3em] uppercase mb-4">
                Exclusive Collection
              </p>
              <div className="w-10 h-[2px] bg-[#C9A961] mb-6" />
              <h2
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
                data-testid="text-promo-title"
              >
                The Bridal{" "}
                <span className="text-[#C9A961] italic">Collection</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A magnificent collection of bridal lehengas featuring heavy kundan and zardozi embroidery.
                Crafted with the finest silk and adorned with thousands of hand-applied sequins for the modern Indian bride.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Each bridal piece takes over 200 hours of meticulous hand-embroidery, 
                ensuring that every bride wearing Ravindrra feels truly extraordinary on her special day.
              </p>
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { label: "Handcrafted", value: "100%" },
                  { label: "Premium Silk", value: "Pure" },
                  { label: "Custom Fit", value: "Tailored" },
                  { label: "Embroidery Hours", value: "200+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-serif font-bold text-[#C9A961]">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/shop?category=lehenga">
                <Button
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold px-8 tracking-wide"
                  data-testid="button-shop-bridal"
                >
                  Shop Bridal Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-3">
              Our Heritage
            </p>
            <div className="w-10 h-[2px] bg-[#C9A961] mb-6" />
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-5"
              data-testid="text-our-story-title"
            >
              A Legacy of{" "}
              <span className="text-[#C9A961] italic">Craftsmanship</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For over three decades, Ravindrra Vastra Niketan has been a trusted name in Indian fashion.
              Founded in 1985, we began as a small family-run textile shop with a vision to bring the finest
              Indian fabrics and traditional artistry to discerning customers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Today, we continue that legacy by working directly with master weavers and artisans from
              Varanasi, Jaipur, and Lucknow, ensuring every piece that carries our name is a testament
              to India's unparalleled textile heritage.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {[
                { icon: Clock, value: "38+", label: "Years" },
                { icon: Users, value: "10K+", label: "Customers" },
                { icon: Star, value: "4.2★", label: "Google Rating" },
                { icon: Award, value: "500+", label: "Products" },
                { icon: MapPin, value: "Pan India", label: "Delivery" },
              ].map((stat) => (
                <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase()}`}>
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#C9A961]/10 flex items-center justify-center mb-2">
                    <stat.icon className="h-4.5 w-4.5 text-[#C9A961]" />
                  </div>
                  <p className="text-lg font-serif font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <img
                  src="/images/products/silk-saree-burgundy.png"
                  alt="Handcrafted Silk Saree"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-md overflow-hidden">
                <img
                  src="/images/products/pink-banarasi-dupatta.png"
                  alt="Banarasi Dupatta"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-3 pt-8">
              <div className="relative aspect-square rounded-md overflow-hidden">
                <img
                  src="/images/products/cream-sherwani.png"
                  alt="Designer Sherwani"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <img
                  src="/images/products/emerald-lehenga.png"
                  alt="Lehenga Choli"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              All Products
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-all-products-title">
              Our Complete Range
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
              Browse through our entire collection of premium Indian clothing
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loadingAll
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : (allProducts || []).slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} rating={ratingsMap?.[product.id]} isWishlisted={wishlistedIds.has(product.id)} onWishlistToggle={isAuthenticated ? handleWishlistToggle : undefined} />
                ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop">
              <Button
                className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] font-semibold px-8 tracking-wide"
                data-testid="button-view-all-products"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <InstagramFeed />

      <section className="py-16 sm:py-20 bg-[#2C3E50] dark:bg-[#1a2530]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Expert Craftsmanship",
                desc: "Every piece is meticulously crafted by skilled artisans who have inherited centuries of textile knowledge. Our craftsmen use traditional techniques passed down through generations.",
                icon: Sparkles,
              },
              {
                title: "Authentic Materials",
                desc: "We source only the finest fabrics - pure Banarasi silk, organic cotton, premium chiffon, and hand-dyed georgette from trusted Indian mills and weaving communities.",
                icon: Shield,
              },
              {
                title: "Personal Service",
                desc: "From selecting the right fabric to custom alterations, our team provides personalized assistance to ensure you find the perfect outfit for your special occasion.",
                icon: Users,
              },
            ].map((item) => (
              <div key={item.title} className="text-center" data-testid={`card-why-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="w-14 h-14 mx-auto rounded-full bg-[#C9A961]/15 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-[#C9A961]" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              Voices of Trust
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-testimonials-title">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-5">
              Hear from our valued customers about their shopping experience with us
            </p>
            <a
              href="https://maps.app.goo.gl/swepGVssrwPn3zfe6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white border rounded-full px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow"
              data-testid="link-google-rating-badge"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-foreground" data-testid="text-google-rating">4.2</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FBBC05] text-[#FBBC05]" />
                    ))}
                    <div className="relative">
                      <Star className="h-3.5 w-3.5 text-[#FBBC05]" />
                      <div className="absolute inset-0 overflow-hidden" style={{ width: "20%" }}>
                        <Star className="h-3.5 w-3.5 fill-[#FBBC05] text-[#FBBC05]" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground" data-testid="text-google-review-count">1,400+ reviews</span>
              </div>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Mahesh Chhabda",
                text: "One stop for all your garments need.. from inner wear to all ethnic wear.. from new born to old age. All this in cost landing price... 365 days of valuable service from 9am to 8pm.. with wide variety under one roof! One just visit this place to see this by their own eyes!",
                rating: 5,
              },
              {
                name: "Avinash P.",
                text: "They got best collection in the rural area. Whenever I visit my Native, I use to shop from them as they got the dress right out from their factory with all detailed work like proper stitching and designs. Moreover these guys provide the elegant design in affordable rates. Best place to shop for Wedding Ceremony or events.",
                rating: 5,
              },
              {
                name: "Mayur Sawant",
                text: "Value for money. Really cheap price for the quality of material. Loved shopping there. Went to shop for just one saree for my wife. Came up buying 17000 worth of 10 sarees. Highly recommended.",
                rating: 5,
              },
              {
                name: "Rahul Koshti",
                text: "This is one of the best shopping place for your clothes. You can purchase A-2-Z, branded-non branded from Low-2-High cost range. The inside of shop is very well maintained and lot of staff around you all the times for your help. I purchased a lot of good quality Sarees, Tops, shirts, pants, blankets and more.",
                rating: 5,
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="p-6 relative" data-testid={`card-testimonial-${testimonial.name.toLowerCase().replace(/\s/g, "-")}`}>
                <Quote className="h-8 w-8 text-[#C9A961]/20 absolute top-4 right-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#C9A961] text-[#C9A961]" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <a
                    href="https://maps.app.goo.gl/swepGVssrwPn3zfe6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground hover:text-[#C9A961] transition-colors"
                    data-testid={`link-google-review-${testimonial.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    Google Review
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 border-y bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above Rs. 1,000" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: Repeat, title: "Easy Returns", desc: "2-day return policy" },
              { icon: Sparkles, title: "Premium Quality", desc: "Handcrafted with care" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4"
                data-testid={`card-feature-${item.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="w-11 h-11 rounded-full bg-[#C9A961]/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-[#C9A961]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              Follow Us
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-instagram-title">
              @ravindrra_vastra
            </h2>
            <p className="text-muted-foreground text-sm">
              Follow us on Instagram for the latest styles, behind-the-scenes, and exclusive previews
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(allProducts || []).slice(0, 6).map((product, i) => (
              <a
                key={product.id}
                href="https://instagram.com/ravindrra_vastra"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-md"
                data-testid={`link-instagram-${i}`}
                aria-label={`View ${product.name} on Instagram`}
              >
                <img
                  src={product.images?.[0] || "/images/products/silk-saree-burgundy.png"}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <SiInstagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/ravindrra_vastra"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="gap-2"
                data-testid="button-follow-instagram"
              >
                <SiInstagram className="h-4 w-4" />
                Follow on Instagram
              </Button>
            </a>
          </div>
        </div>
      </section>

      <RecentlyViewed />

      <section className="py-24 sm:py-28 bg-[#2C3E50] dark:bg-[#1a2530] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="w-12 h-[2px] bg-[#C9A961] mx-auto mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            The Art of Indian Fashion
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Each piece in our collection tells a story of craftsmanship, tradition, and elegance.
            Experience the beauty of India's rich textile heritage. Visit our store or shop online
            for a curated selection of premium Indian clothing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop">
              <Button
                className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] px-8 font-semibold tracking-wide"
                data-testid="button-explore-all"
              >
                Explore All Collections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="https://wa.me/918889777992" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="text-white border-white/25 bg-white/5 px-8 tracking-wide"
                data-testid="button-whatsapp-cta"
              >
                Contact Us on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
