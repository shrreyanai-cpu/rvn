import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, ChevronRight } from "lucide-react";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Category } from "@shared/schema";

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

  const mainCategories = categories?.filter((c) => !c.parentId) || [];
  const getSubcategories = (parentId: number) => categories?.filter((c) => c.parentId === parentId) || [];

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

            <NavigationMenu>
              <NavigationMenuList>
                {mainCategories.map((main) => {
                  const subs = getSubcategories(main.id);
                  if (subs.length === 0) {
                    return (
                      <NavigationMenuItem key={main.id}>
                        <Link href={`/shop?category=${main.slug}`}>
                          <span
                            className="px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                            data-testid={`link-nav-${main.slug}`}
                          >
                            {main.name}
                          </span>
                        </Link>
                      </NavigationMenuItem>
                    );
                  }
                  return (
                    <NavigationMenuItem key={main.id}>
                      <NavigationMenuTrigger
                        className="text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent"
                        data-testid={`link-nav-${main.slug}`}
                      >
                        {main.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[280px] p-3" data-testid={`dropdown-${main.slug}`}>
                          <Link href={`/shop?category=${main.slug}`}>
                            <div className="px-3 py-2 rounded-md text-sm font-semibold text-[#C9A961] hover-elevate transition-colors cursor-pointer mb-1" data-testid={`link-dropdown-all-${main.slug}`}>
                              All {main.name}
                            </div>
                          </Link>
                          <div className="grid grid-cols-1 gap-0.5">
                            {subs.map((sub) => (
                              <Link key={sub.id} href={`/shop?category=${sub.slug}`}>
                                <div
                                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover-elevate transition-colors cursor-pointer"
                                  data-testid={`link-dropdown-${sub.slug}`}
                                >
                                  {sub.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
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
                  <Link href="/orders">
                    <DropdownMenuItem data-testid="link-my-orders">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin">
                    <DropdownMenuItem data-testid="link-admin-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </Link>
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
