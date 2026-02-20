import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { SiInstagram, SiFacebook, SiYoutube, SiWhatsapp } from "react-icons/si";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (emailValue: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email: emailValue });
      return response.json();
    },
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
      toast({ title: "Subscribed!", description: "Thank you for joining our newsletter." });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast({ title: "Already Subscribed", description: "This email is already on our list." });
        setSubscribed(true);
      } else {
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    subscribeMutation.mutate(email);
  };

  return (
    <div className="bg-[#2C3E50] dark:bg-[#1a2a38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="text-center md:text-left flex-shrink-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Mail className="h-5 w-5 text-[#C9A961]" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white" data-testid="text-footer-newsletter-title">
                Join Our Newsletter
              </h3>
            </div>
            <p className="text-white/60 text-sm max-w-sm">
              Get exclusive deals, new arrivals & style tips delivered to your inbox.
            </p>
          </div>

          <div className="w-full md:max-w-md">
            {subscribed ? (
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-5 py-3" data-testid="text-footer-subscribed">
                <CheckCircle2 className="h-5 w-5 text-[#C9A961] flex-shrink-0" />
                <p className="text-white text-sm">You're all set! Check your inbox for a welcome surprise.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-footer-newsletter">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribeMutation.isPending}
                    className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#C9A961] focus-visible:border-[#C9A961]"
                    data-testid="input-footer-newsletter-email"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="h-11 px-5 bg-[#C9A961] hover:bg-[#b8985a] text-[#2C3E50] font-semibold group whitespace-nowrap"
                  data-testid="button-footer-subscribe"
                >
                  {subscribeMutation.isPending ? (
                    <span className="h-4 w-4 border-2 border-[#2C3E50]/30 border-t-[#2C3E50] rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Subscribe
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            )}
            {!subscribed && (
              <p className="text-white/30 text-[11px] mt-2 pl-1">No spam, ever. Unsubscribe anytime.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <FooterNewsletter />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
              <img src="/logo.png" alt="Ravindrra Vastra Niketan" className="h-8 w-8 object-contain" />
              <span>
                <span className="text-foreground">RAVINDRRA</span>{" "}
                <span className="text-[#C9A961]">VASTRA NIKETAN</span>
              </span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Premium Indian clothing for every occasion. Traditional elegance meets modern craftsmanship.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/ravindrra_vastra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover-elevate transition-colors"
                data-testid="link-footer-instagram"
                aria-label="Follow us on Instagram"
              >
                <SiInstagram className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://facebook.com/ravindrra.vastra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover-elevate transition-colors"
                data-testid="link-footer-facebook"
                aria-label="Follow us on Facebook"
              >
                <SiFacebook className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://youtube.com/@ravindrra_vastra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover-elevate transition-colors"
                data-testid="link-footer-youtube"
                aria-label="Subscribe on YouTube"
              >
                <SiYoutube className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://wa.me/918889777992"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover-elevate transition-colors"
                data-testid="link-footer-whatsapp"
                aria-label="Chat on WhatsApp"
              >
                <SiWhatsapp className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Sarees", slug: "sarees" },
                { label: "Men's Wear", slug: "mens-wear" },
                { label: "Women's Wear", slug: "womens-wear" },
                { label: "Kids Wear", slug: "kids-wear" },
              ].map((item) => (
                <li key={item.slug}>
                  <Link href={`/shop?category=${item.slug}`}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Policies</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms-conditions">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-terms">
                    Terms & Conditions
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-privacy">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-delivery">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-shipping">
                    Shipping & Delivery
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/return-policy">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-return-policy">
                    Return & Refund Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/flash-sale">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-flash-sale">
                    Flash Sale
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/track-order">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-track-order">
                    Track Order
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-contact">
                    Contact Us
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Ravindrra Vastra Niketan</li>
              <li>info@ravindrra.com</li>
              <li>+91 88897 77992</li>
            </ul>
            <a
              href="https://wa.me/918889777992"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
              data-testid="link-footer-whatsapp-chat"
            >
              <SiWhatsapp className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ravindrra Vastra Niketan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <Link href="/privacy-policy">
              <span className="hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-bottom-privacy">Privacy Policy</span>
            </Link>
            <Link href="/terms-conditions">
              <span className="hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-bottom-terms">Terms & Conditions</span>
            </Link>
            <Link href="/shipping-delivery">
              <span className="hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-bottom-shipping">Shipping</span>
            </Link>
            <Link href="/return-policy">
              <span className="hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-bottom-returns">Returns</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
