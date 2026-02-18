import { Link } from "wouter";
import { ArrowRight, Truck, Shield, Repeat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const { data: featuredProducts, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products?featured=true"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <img
          src="/images/hero-banner.png"
          alt="Luxury Indian Clothing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <div className="max-w-xl">
            <p className="text-[#C9A961] text-sm sm:text-base font-medium tracking-[0.2em] uppercase mb-3" data-testid="text-hero-subtitle">
              Premium Indian Fashion
            </p>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
              data-testid="text-hero-title"
            >
              Timeless Elegance,{" "}
              <span className="text-[#C9A961]">Modern Grace</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              Discover exquisite handcrafted clothing that celebrates India's rich textile heritage with contemporary sophistication.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop">
                <Button
                  className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] font-semibold px-6"
                  data-testid="button-shop-collection"
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shop?featured=true">
                <Button
                  variant="outline"
                  className="text-white border-white/30 backdrop-blur-sm bg-white/10"
                  data-testid="button-view-featured"
                >
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-categories-title">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Explore our curated collections</p>
          </div>
          <Link href="/shop">
            <Button variant="ghost" size="sm" data-testid="link-view-all-categories">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loadingCategories
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-md" />
              ))
            : categories?.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
                  <Card
                    className="group relative aspect-[3/4] overflow-hidden cursor-pointer border-0"
                    data-testid={`card-category-${cat.id}`}
                  >
                    {cat.imageUrl && (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-white text-lg font-semibold">{cat.name}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-featured-title">
                Featured Collection
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked pieces for you</p>
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
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders above Rs. 2,999" },
            { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
            { icon: Repeat, title: "Easy Returns", desc: "30-day return policy" },
            { icon: Sparkles, title: "Premium Quality", desc: "Handcrafted with care" },
          ].map((item) => (
            <Card
              key={item.title}
              className="p-6 text-center"
              data-testid={`card-feature-${item.title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#C9A961]/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-[#C9A961]" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-[#2C3E50] dark:bg-[#1a2530]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-3">
            The Art of Indian Fashion
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Each piece in our collection tells a story of craftsmanship, tradition, and elegance.
            Experience the beauty of India's textile heritage.
          </p>
          <Link href="/shop">
            <Button className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961]" data-testid="button-explore-all">
              Explore All Collections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
