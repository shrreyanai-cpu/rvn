import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  // Check if newsletter should be shown
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem(NEWSLETTER_DISMISSED_KEY);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const now = Date.now();
        if (now - dismissedTime < SEVEN_DAYS_MS) {
          return; // Still within 7 days, don't show
        }
      }
      setOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Subscribe mutation
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
      }, 2000);
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

  const handleSubscribe = () => {
    if (!email) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border border-[#2C3E50] bg-white dark:bg-slate-950" data-testid="dialog-newsletter">
        {showThankYou ? (
          <div className="text-center py-6" data-testid="text-thank-you">
            <h2 className="font-serif text-2xl text-[#2C3E50] dark:text-[#C9A961] mb-2">
              Thank You!
            </h2>
            <p className="text-muted-foreground">
              Check your email for exclusive offers.
            </p>
          </div>
        ) : (
          <div>
            <DialogTitle className="font-serif text-2xl text-[#2C3E50] dark:text-[#C9A961] text-center mb-2" data-testid="text-stay-in-style">
              Stay in Style
            </DialogTitle>
            <DialogDescription className="text-center text-base mb-6" data-testid="text-subscribe-description">
              Subscribe to get exclusive deals, new arrivals & fashion updates
            </DialogDescription>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribeMutation.isPending}
                data-testid="input-email"
                className="border-[#C9A961] focus:border-[#2C3E50]"
              />

              <Button
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className="w-full bg-[#C9A961] hover:bg-[#B8985A] text-white dark:text-[#2C3E50] font-semibold"
                data-testid="button-subscribe"
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleDismiss}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-no-thanks"
                >
                  No thanks
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
