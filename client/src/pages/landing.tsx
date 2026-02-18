import { Link } from "wouter";
import { ArrowRight, Sparkles, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] overflow-hidden">
        <img
          src="/images/hero-banner.png"
          alt="Luxury Indian Clothing Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <div className="max-w-xl">
            <p
              className="text-[#C9A961] text-sm font-medium tracking-[0.25em] uppercase mb-4"
              data-testid="text-landing-subtitle"
            >
              Est. Since 1985
            </p>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
              data-testid="text-landing-title"
            >
              Where Tradition Meets{" "}
              <span className="text-[#C9A961]">Elegance</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
              Discover handcrafted Indian clothing that celebrates centuries of textile artistry.
              From timeless sarees to regal sherwanis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] font-semibold px-8"
                onClick={() => (window.location.href = "/login")}
                data-testid="button-landing-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/shop">
                <Button
                  variant="outline"
                  className="text-white border-white/30 backdrop-blur-sm bg-white/10"
                  data-testid="button-landing-browse"
                >
                  Browse Collection
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-white/60 text-xs">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Secure Payments
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" /> Premium Quality
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold mb-3" data-testid="text-why-choose">
            Why Choose Ravindrra Vastra Niketan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three decades of delivering exquisite Indian fashion to discerning customers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Handcrafted Excellence",
              desc: "Every piece is meticulously crafted by skilled artisans preserving age-old techniques passed down through generations.",
            },
            {
              icon: Shield,
              title: "Authentic Materials",
              desc: "We source only the finest fabrics - pure silk, organic cotton, and premium chiffon from trusted Indian mills.",
            },
            {
              icon: Star,
              title: "Curated Collections",
              desc: "From bridal lehengas to everyday kurtas, our collections are thoughtfully designed for every occasion.",
            },
          ].map((item) => (
            <Card key={item.title} className="p-8 text-center" data-testid={`card-landing-feature-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C9A961]/10 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-[#C9A961]" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-[#2C3E50] dark:bg-[#1a2530]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-3">
            Start Your Journey Today
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Sign in to explore our full collection, save favorites, and enjoy a personalized shopping experience.
          </p>
          <Button
            className="bg-[#C9A961] text-[#1A1A1A] border-[#C9A961] font-semibold px-8"
            onClick={() => (window.location.href = "/login")}
            data-testid="button-landing-cta-signin"
          >
            Sign In to Shop
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
