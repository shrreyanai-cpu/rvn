import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialMode = params?.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register" | "verify" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login, register, verifyOtp, resendOtp, forgotPassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const errorParam = params?.get("error");
    if (errorParam) {
      toast({
        title: "Sign-in Error",
        description: "An error occurred during sign-in. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (mode === "verify") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [mode]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
        setLocation("/");
      } else if (mode === "register") {
        const result = await register.mutateAsync({ email, password, firstName, lastName });
        if (result.requiresVerification) {
          setVerifyEmail(email);
          setMode("verify");
          setResendCooldown(60);
          toast({ title: "Verification code sent!", description: "Please check your email for the 6-digit code." });
        } else {
          setLocation("/");
        }
      }
    } catch (error: any) {
      if (error?.requiresVerification) {
        setVerifyEmail(error.email || email);
        setMode("verify");
        setResendCooldown(60);
        toast({ title: "Email not verified", description: "A new verification code has been sent to your email." });
        return;
      }
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      toast({ title: "Please enter the full 6-digit code", variant: "destructive" });
      return;
    }
    try {
      await verifyOtp.mutateAsync({ email: verifyEmail, otp });
      toast({ title: "Email verified!", description: "Welcome to Ravindrra Vastra Niketan." });
      setLocation("/");
    } catch (error: any) {
      const msg = error?.message || "";
      let description = "Invalid or expired code. Please try again.";
      try {
        const parsed = JSON.parse(msg.split(": ").slice(1).join(": ") || "{}");
        description = parsed.message || description;
      } catch {}
      toast({ title: "Verification Failed", description, variant: "destructive" });
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOtp.mutateAsync({ email: verifyEmail });
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      toast({ title: "Code sent!", description: "A new verification code has been sent to your email." });
    } catch {
      toast({ title: "Failed to resend code", variant: "destructive" });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    try {
      await forgotPassword.mutateAsync({ email });
      toast({
        title: "Reset link sent!",
        description: "If an account exists with this email, you will receive a reset link shortly.",
      });
      setMode("login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isPending = login.isPending || register.isPending || forgotPassword.isPending || verifyOtp.isPending || resendOtp.isPending;

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
          {mode === "verify" ? (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setOtpDigits(["", "", "", "", "", ""]); }}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-6"
                  data-testid="link-back-login"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <ShieldCheck className="h-7 w-7 text-[#C9A961]" />
                  <h1 className="font-serif text-2xl font-bold" data-testid="text-verify-title">
                    Verify Your Email
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  We've sent a 6-digit code to <span className="font-medium text-foreground">{verifyEmail}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-colors"
                      data-testid={`input-otp-${i}`}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
                  disabled={verifyOtp.isPending || otpDigits.join("").length !== 6}
                  data-testid="button-verify-otp"
                >
                  {verifyOtp.isPending ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || resendOtp.isPending}
                      className="text-[#C9A961] font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                      data-testid="button-resend-otp"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resendOtp.isPending ? "Sending..." : "Resend Code"}
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : mode === "forgot" ? (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-6"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <KeyRound className="h-7 w-7 text-[#C9A961]" />
                  <h1 className="font-serif text-2xl font-bold">Forgot Password?</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A] font-semibold"
                  disabled={forgotPassword.isPending}
                >
                  {forgotPassword.isPending ? "Sending Link..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <>
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

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-[#C9A961] font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
