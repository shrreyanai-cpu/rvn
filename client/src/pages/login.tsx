import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { SiFacebook, SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ email, password, firstName, lastName });
      }
      setLocation("/");
    } catch (error: any) {
      const msg = error?.message || "Something went wrong";
      let description = "Please try again.";
      try {
        const parsed = JSON.parse(msg.split(": ").slice(1).join(": ") || "{}");
        description = parsed.message || description;
      } catch {
        if (msg.includes("401")) description = "Invalid email or password.";
        else if (msg.includes("409")) description = "An account with this email already exists.";
      }
      toast({
        title: mode === "login" ? "Login Failed" : "Registration Failed",
        description,
        variant: "destructive",
      });
    }
  };

  const isPending = login.isPending || register.isPending;

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
              Where Tradition Meets{" "}
              <span className="text-[#C9A961] italic">Elegance</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Discover exquisite handcrafted Indian clothing from Ravindrra Vastra Niketan.
              Premium fabrics, timeless designs.
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { value: "500+", label: "Products" },
              { value: "30+", label: "Years" },
              { value: "10K+", label: "Customers" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-serif font-bold text-[#C9A961]">{stat.value}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-6" data-testid="link-back-home">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to store
              </span>
            </Link>
            <h1 className="font-serif text-2xl font-bold mb-1" data-testid="text-login-title">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to your account to continue shopping"
                : "Join Ravindrra Vastra Niketan today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-first-name"
                  />
                </div>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoFocus
                data-testid="input-email"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={mode === "register" ? 6 : 1}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
              disabled={isPending}
              data-testid="button-submit-login"
            >
              {isPending
                ? "Please wait..."
                : mode === "login"
                ? "Continue with Email"
                : "Create Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2"
              type="button"
              data-testid="button-google-login"
              onClick={() =>
                toast({
                  title: "Coming Soon",
                  description: "Google sign-in will be available soon.",
                })
              }
            >
              <SiGoogle className="h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              type="button"
              data-testid="button-facebook-login"
              onClick={() =>
                toast({
                  title: "Coming Soon",
                  description: "Facebook sign-in will be available soon.",
                })
              }
            >
              <SiFacebook className="h-4 w-4" />
              Facebook
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-[#C9A961] font-medium hover:underline"
                  data-testid="button-switch-register"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#C9A961] font-medium hover:underline"
                  data-testid="button-switch-login"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
