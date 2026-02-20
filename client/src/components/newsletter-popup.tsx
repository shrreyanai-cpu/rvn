import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Sparkles, CheckCircle2, ArrowRight, X } from "lucide-react";

const NEWSLETTER_DISMISSED_KEY = "newsletter_dismissed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface NewsletterResponse {
  success: boolean;
  message: string;
}

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem(NEWSLETTER_DISMISSED_KEY);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const now = Date.now();
        if (now - dismissedTime < SEVEN_DAYS_MS) {
          return;
        }
      }
      setOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async (emailValue: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email: emailValue });
      return response.json() as Promise<NewsletterResponse>;
    },
    onSuccess: () => {
      setShowThankYou(true);
      toast({
        title: "Success",
        description: "Thank you for subscribing to our newsletter!",
      });
      localStorage.setItem(NEWSLETTER_DISMISSED_KEY, Date.now().toString());
      setTimeout(() => {
        setOpen(false);
        setEmail("");
        setShowThankYou(false);
      }, 3000);
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "default",
        });
        setOpen(false);
        setEmail("");
        localStorage.setItem(NEWSLETTER_DISMISSED_KEY, Date.now().toString());
      } else {
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubscribe = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    subscribeMutation.mutate(email);
  };

  const handleDismiss = () => {
    setOpen(false);
    setEmail("");
    localStorage.setItem(NEWSLETTER_DISMISSED_KEY, Date.now().toString());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="p-0 border-0 overflow-hidden max-w-lg bg-transparent shadow-2xl gap-0" data-testid="dialog-newsletter">
        {showThankYou ? (
          <div className="bg-[#2C3E50] text-white px-8 py-14 text-center relative">
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A961' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#C9A961]/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-8 w-8 text-[#C9A961]" />
              </div>
              <DialogTitle className="font-serif text-3xl mb-3" data-testid="text-thank-you">
                Welcome Aboard!
              </DialogTitle>
              <DialogDescription className="text-white/70 text-base max-w-xs mx-auto">
                You're now part of our exclusive circle. Watch your inbox for curated collections and members-only offers.
              </DialogDescription>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5" data-testid="newsletter-content">
            <div className="sm:col-span-2 bg-[#2C3E50] text-white p-6 sm:p-8 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A961' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A961]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C9A961]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#C9A961]/20 border border-[#C9A961]/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-[#C9A961]" />
                </div>
                <p className="text-[#C9A961] text-xs font-semibold uppercase tracking-[0.2em] mb-1">Exclusive</p>
                <p className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                  10<span className="text-[#C9A961]">%</span>
                </p>
                <p className="text-sm text-white/60 mt-1">off your first order</p>
              </div>
            </div>

            <div className="sm:col-span-3 bg-white dark:bg-slate-950 p-6 sm:p-8 flex flex-col justify-center relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-accent"
                data-testid="button-close-newsletter"
              >
                <X className="h-4 w-4" />
              </button>

              <DialogTitle className="font-serif text-xl sm:text-2xl text-[#2C3E50] dark:text-white mb-1" data-testid="text-stay-in-style">
                Stay in Style
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mb-5" data-testid="text-subscribe-description">
                Join our community for early access to new arrivals, exclusive deals, and fashion inspiration.
              </DialogDescription>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribeMutation.isPending}
                    data-testid="input-email"
                    className="pl-10 h-11 border-[#2C3E50]/20 dark:border-white/20 focus-visible:ring-[#C9A961] focus-visible:border-[#C9A961]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full h-11 bg-[#2C3E50] hover:bg-[#1a2a38] dark:bg-[#C9A961] dark:hover:bg-[#b8985a] text-white dark:text-[#2C3E50] font-semibold group transition-all"
                  data-testid="button-subscribe"
                >
                  {subscribeMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Subscribing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Subscribe & Get 10% Off
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 flex items-start gap-2">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
                  <span>No spam</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                  <span>Unsubscribe anytime</span>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors text-center w-full"
                data-testid="button-no-thanks"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
