import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { isAdminRole } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Category } from "@shared/schema";

function CategoryDropdown({ main, subs, navigate }: { main: Category; subs: Category[]; navigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
        onClick={() => navigate(`/shop?category=${main.slug}`)}
        data-testid={`link-nav-${main.slug}`}
      >
        {main.name}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-50"
          data-testid={`dropdown-${main.slug}`}
        >
          <div className="w-[240px] rounded-lg border bg-popover text-popover-foreground shadow-lg p-2 animate-in fade-in-0 zoom-in-95 duration-150">
            <Link href={`/shop?category=${main.slug}`} onClick={() => setOpen(false)}>
              <div
                className="px-3 py-2 rounded-md text-sm font-semibold text-[#C9A961] hover:bg-accent transition-colors cursor-pointer mb-0.5"
                data-testid={`link-dropdown-all-${main.slug}`}
              >
                All {main.name}
              </div>
            </Link>
            {subs.map((sub) => (
              <Link key={sub.id} href={`/shop?category=${sub.slug}`} onClick={() => setOpen(false)}>
                <div
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  data-testid={`link-dropdown-${sub.slug}`}
                >
                  {sub.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const simpleLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

export default function Header() {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const mainCategories = (categories?.filter((c) => !c.parentId) || []).sort((a, b) => a.name.localeCompare(b.name));
  const getSubcategories = (parentId: number) => (categories?.filter((c) => c.parentId === parentId) || []).sort((a, b) => a.name.localeCompare(b.name));

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const userInitials = user
    ? `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || "U"
    : "";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-mobile-menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6">
                <div className="flex flex-col gap-1 mt-8">
                  {simpleLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                      <span
                        className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover-elevate ${
                          location === link.href ? "bg-primary/10 text-foreground" : "text-muted-foreground"
                        }`}
                        data-testid={`link-mobile-nav-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  {mainCategories.map((main) => {
                    const subs = getSubcategories(main.id);
                    const isExpanded = mobileExpanded === main.id;
                    return (
                      <div key={main.id}>
                        <button
                          onClick={() => {
                            if (subs.length > 0) {
                              setMobileExpanded(isExpanded ? null : main.id);
                            } else {
                              navigate(`/shop?category=${main.slug}`);
                              setMobileOpen(false);
                            }
                          }}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover-elevate transition-colors"
                          data-testid={`link-mobile-nav-${main.slug}`}
                        >
                          {main.name}
                          {subs.length > 0 && (
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          )}
                        </button>
                        {isExpanded && subs.length > 0 && (
                          <div className="ml-3 border-l pl-2 space-y-0.5 mt-0.5 mb-1">
                            <Link href={`/shop?category=${main.slug}`} onClick={() => setMobileOpen(false)}>
                              <span className="block px-3 py-2 rounded-md text-xs font-medium text-[#C9A961] hover-elevate transition-colors" data-testid={`link-mobile-sub-all-${main.slug}`}>
                                All {main.name}
                              </span>
                            </Link>
                            {subs.map((sub) => (
                              <Link key={sub.id} href={`/shop?category=${sub.slug}`} onClick={() => setMobileOpen(false)}>
                                <span className="block px-3 py-2 rounded-md text-xs text-muted-foreground hover-elevate transition-colors" data-testid={`link-mobile-sub-${sub.slug}`}>
                                  {sub.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <img src="/logo.png" alt="Ravindrra Vastra Niketan" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[hsl(210,25%,28%)] dark:text-[hsl(45,35%,92%)]">RAVINDRRA</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {simpleLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {mainCategories.map((main) => {
              const subs = getSubcategories(main.id);
              if (subs.length === 0) {
                return (
                  <Link key={main.id} href={`/shop?category=${main.slug}`}>
                    <span
                      className="px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                      data-testid={`link-nav-${main.slug}`}
                    >
                      {main.name}
                    </span>
                  </Link>
                );
              }
              return (
                <CategoryDropdown key={main.id} main={main} subs={subs} navigate={navigate} />
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/search">
              <Button size="icon" variant="ghost" data-testid="button-search">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {isAuthenticated && (
              <Link href="/cart">
                <Button size="icon" variant="ghost" className="relative" data-testid="button-cart">
                  <ShoppingBag className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#C9A961] text-white border-0 no-default-hover-elevate no-default-active-elevate"
                      data-testid="badge-cart-count"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {isLoading ? (
              <div className="w-9 h-9" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid="button-user-menu">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs bg-[#C9A961]/15 text-[#C9A961]">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="text-user-name">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem data-testid="link-my-profile">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownMenuItem data-testid="link-my-orders">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                  </Link>
                  {isAdminRole((user as any)?.role || ((user as any)?.isAdmin ? "super_admin" : "customer")) && (
                    <Link href="/admin">
                      <DropdownMenuItem data-testid="link-admin-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/api/logout")}
                    data-testid="button-logout"
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-login"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/login?mode=register">
                  <Button
                    size="icon"
                    data-testid="button-create-account"
                    className="sm:hidden bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    data-testid="button-create-account-full"
                    className="hidden sm:inline-flex bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
                  >
                    <User className="mr-1.5 h-3.5 w-3.5" />
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
