import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center text-destructive">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-8">
            This password reset link is invalid or has expired.
          </p>
          <Button onClick={() => setLocation("/login")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, newPassword });
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error?.message || "Failed to reset password. The link might be expired.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/images/hero-banner.png"
          alt="Ravindrra Vastra Niketan"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="mb-8">
            <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-3">
              Secure Your <span className="text-[#C9A961] italic">Account</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Timeless elegance deserves premium protection. Set a new password and continue your journey with us.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <KeyRound className="h-7 w-7 text-[#C9A961]" />
              <h1 className="font-serif text-2xl font-bold">New Password</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Please enter and confirm your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </Button>
            
            <button
              type="button"
              className="w-full text-muted-foreground text-xs hover:text-[#C9A961] transition-colors mt-2"
              onClick={() => setLocation("/login")}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
