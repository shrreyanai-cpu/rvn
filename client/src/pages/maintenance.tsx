import { useState } from "react";
import { Link } from "wouter";
import { Wrench, LogIn, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title?: string;
  message?: string;
}

export default function MaintenancePage({ title, message }: Props) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#2C3E50] via-[#1a2a3a] to-[#2C3E50] px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 25% 25%, #C9A961 0%, transparent 50%), radial-gradient(circle at 75% 75%, #C9A961 0%, transparent 50%)"
      }} />

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="mb-8">
          <p className="text-[#C9A961] text-xs font-semibold tracking-[0.25em] uppercase mb-6">
            Ravindrra Vastra Niketan
          </p>

          <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[#C9A961]/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-20 h-20 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30 flex items-center justify-center">
              <Wrench className="h-9 w-9 text-[#C9A961]" />
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="text-maintenance-title">
            {title || "We'll Be Right Back"}
          </h1>

          <p className="text-white/65 leading-relaxed text-sm sm:text-base" data-testid="text-maintenance-message">
            {message || "Our site is currently undergoing scheduled maintenance. We'll be back shortly."}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center mb-8 text-white/40 text-xs">
          <Clock className="h-3.5 w-3.5" />
          <span>We apologize for the inconvenience</span>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs mb-4">Are you a staff member?</p>
          <Link href="/login">
            <Button
              variant="outline"
              className="border-[#C9A961]/50 text-[#C9A961] hover:bg-[#C9A961]/10 hover:border-[#C9A961] bg-transparent"
              data-testid="button-maintenance-login"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Continue with your account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
