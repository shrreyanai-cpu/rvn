import { useState, useEffect } from "react";
import { Cookie, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const COOKIE_KEY = "rvn_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="banner-cookie-consent"
    >
      <div className="bg-[#2C3E50] text-white shadow-2xl border-t border-[#C9A961]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-full bg-[#C9A961]/20 flex items-center justify-center mt-0.5">
              <Cookie className="h-4 w-4 text-[#C9A961]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#C9A961]" />
                We use cookies
              </p>
              <p className="text-xs text-white/70 leading-relaxed">
                We use cookies to improve your experience, personalize content, and analyze traffic.
                By clicking "Accept", you agree to our{" "}
                <Link href="/privacy-policy">
                  <span className="text-[#C9A961] hover:underline cursor-pointer">Privacy Policy</span>
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={decline}
              className="flex-1 sm:flex-none border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent text-xs"
              data-testid="button-cookie-decline"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={accept}
              className="flex-1 sm:flex-none bg-[#C9A961] hover:bg-[#b8944f] text-[#2C3E50] font-semibold text-xs"
              data-testid="button-cookie-accept"
            >
              Accept All
            </Button>
            <button
              onClick={decline}
              className="text-white/50 hover:text-white transition-colors p-1 shrink-0"
              aria-label="Dismiss"
              data-testid="button-cookie-dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
