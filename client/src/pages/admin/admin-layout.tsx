import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, FolderOpen,
  LogOut, Store, ChevronLeft, Truck, Shield, Mail, RotateCcw
} from "lucide-react";
import { hasPermission, isAdminRole, type Permission } from "@shared/models/auth";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navItems: { href: string; label: string; icon: any; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "manage_products" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "view_orders" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "view_customers" },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen, permission: "manage_categories" },
  { href: "/admin/coupons", label: "Coupons", icon: Tag, permission: "manage_coupons" },
  { href: "/admin/delivery", label: "Delivery", icon: Truck, permission: "manage_delivery" },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw, permission: "manage_orders" },
  { href: "/admin/emails", label: "Emails", icon: Mail, permission: "manage_customers" },
  { href: "/admin/roles", label: "Roles", icon: Shield, permission: "manage_roles" },
];

function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const userRole = (user as any)?.role || ((user as any)?.isAdmin ? "super_admin" : "customer");

  const userInitials = user
    ? `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || "A"
    : "A";

  const visibleNavItems = navItems.filter((item) => hasPermission(userRole, item.permission));

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#2C3E50] dark:bg-[#C9A961] flex items-center justify-center">
            <Store className="h-4 w-4 text-white dark:text-[#1A1A1A]" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold leading-tight" data-testid="text-admin-brand">
              Ravindrra Vastra Niketan
            </h2>
            <p className="text-[10px] text-muted-foreground leading-tight">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    data-testid={`link-admin-${item.label.toLowerCase()}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-testid="link-admin-back-store">
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-testid="link-admin-logout">
              <a href="/api/logout">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-[#C9A961]/15 text-[#C9A961]">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-admin-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center gap-4 p-3 border-b">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <Link href="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="Ravindrra Vastra Niketan" className="h-7 w-7 object-contain" data-testid="img-admin-logo" />
              <span className="font-serif text-sm font-bold tracking-wide text-[hsl(210,25%,28%)] dark:text-[hsl(45,35%,92%)] hidden sm:inline" data-testid="text-admin-navbar-brand">
                RAVINDRRA
              </span>
            </Link>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
