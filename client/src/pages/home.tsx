import { Link } from "wouter";
import { ArrowRight, Truck, Shield, Repeat, Sparkles, Star, Quote } from "lucide-react";
import { SiInstagram } from "react-icons/si";
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

  const { data: allProducts, isLoading: loadingAll } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const newArrivals = allProducts?.filter((p) => !p.featured).slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] overflow-hidden">
        <img
          src="/images/hero-banner.png"
          alt="Luxury Indian Clothing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <div className="max-w-xl">
            <p
              className="text-[#C9A961] text-xs sm:text-sm font-medium tracking-[0.3em] uppercase mb-5"
              data-testid="text-hero-subtitle"
            >
              Premium Indian Fashion
            </p>
            <div className="w-12 h-[2px] bg-[#C9A961] mb-6" />
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5"
              data-testid="text-hero-title"
            >
              Timeless Elegance,{" "}
              <span className="text-[#C9A961] italic">Modern Grace</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              Discover exquisite handcrafted clothing that celebrates India's rich textile heritage with contemporary sophistication.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button
                  className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] font-semibold px-8 tracking-wide"
                  data-testid="button-shop-collection"
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shop?featured=true">
                <Button
                  variant="outline"
                  className="text-white border-white/25 backdrop-blur-sm bg-white/5 px-8 tracking-wide"
                  data-testid="button-view-featured"
                >
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === 0 ? "w-8 bg-[#C9A961]" : "w-4 bg-white/30"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="overflow-hidden bg-[#2C3E50] dark:bg-[#1a2530] py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center shrink-0">
              {[
                "Handcrafted with Love",
                "Free Shipping Above Rs. 2,999",
                "Premium Quality Fabrics",
                "30-Day Easy Returns",
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

      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              Explore
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-categories-title">
              Shop by Category
            </h2>
          </div>
          <Link href="/shop">
            <Button variant="ghost" size="sm" data-testid="link-view-all-categories">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {loadingCategories
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-md" />
              ))
            : categories?.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
                  <div
                    className="group relative aspect-[3/4] overflow-hidden rounded-md cursor-pointer"
                    data-testid={`card-category-${cat.id}`}
                  >
                    {cat.imageUrl && (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/80" />
                    <div className="absolute inset-0 border border-white/0 group-hover:border-[#C9A961]/50 rounded-md transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-white text-lg font-semibold mb-1">{cat.name}</h3>
                      <span className="text-white/0 group-hover:text-white/80 text-xs font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-1">
                        Shop Now <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Curated for You
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-featured-title">
                Featured Collection
              </h2>
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

      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-md overflow-hidden">
              <img
                src="/images/products/red-bridal-lehenga.png"
                alt="The Bridal Collection"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="lg:pl-8">
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.3em] uppercase mb-4">
                Exclusive
              </p>
              <div className="w-10 h-[2px] bg-[#C9A961] mb-6" />
              <h2
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
                data-testid="text-promo-title"
              >
                The Bridal{" "}
                <span className="text-[#C9A961] italic">Collection</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                A magnificent collection of bridal lehengas featuring heavy kundan and zardozi embroidery.
                Crafted with the finest silk and adorned with thousands of hand-applied sequins for the modern Indian bride.
              </p>
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { label: "Handcrafted", value: "100%" },
                  { label: "Premium Silk", value: "Pure" },
                  { label: "Custom Fit", value: "Tailored" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-serif font-bold text-[#C9A961]">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/shop?category=lehengas">
                <Button
                  className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold px-8 tracking-wide"
                  data-testid="button-shop-bridal"
                >
                  Shop Bridal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Just In
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-new-arrivals-title">
                New Arrivals
              </h2>
            </div>
            <Link href="/shop">
              <Button variant="ghost" size="sm" data-testid="link-view-all-products">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loadingAll
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              Voices of Trust
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-testimonials-title">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                location: "Mumbai",
                text: "The quality of the silk saree I purchased was absolutely breathtaking. The intricate zari work is even more beautiful in person. Truly a masterpiece!",
                rating: 5,
              },
              {
                name: "Arjun Patel",
                location: "Delhi",
                text: "Ordered a sherwani for my wedding and it was perfect. The fit, the embroidery, the fabric - everything exceeded my expectations. Thank you, Ravindrra!",
                rating: 5,
              },
              {
                name: "Meera Krishnan",
                location: "Bangalore",
                text: "I've been ordering from Ravindrra for two years now. The consistency in quality and their attention to detail is what keeps me coming back. Highly recommended!",
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
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-y bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above Rs. 2,999" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: Repeat, title: "Easy Returns", desc: "30-day return policy" },
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

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[#C9A961] text-xs font-medium tracking-[0.2em] uppercase mb-2">
              Follow Us
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-instagram-title">
              @ravindrra_vastra
            </h2>
            <p className="text-muted-foreground text-sm">
              Follow us on Instagram for the latest styles and behind-the-scenes
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

      <section className="py-20 sm:py-24 bg-[#2C3E50] dark:bg-[#1a2530] relative overflow-hidden">
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
            Experience the beauty of India's rich textile heritage.
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
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="text-white border-white/25 bg-white/5 px-8 tracking-wide"
                data-testid="button-whatsapp-cta"
              >
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
