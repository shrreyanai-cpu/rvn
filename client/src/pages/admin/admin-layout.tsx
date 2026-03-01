import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, FolderOpen,
  LogOut, ChevronLeft, Truck, Shield, Mail, RotateCcw, BarChart3,
  Bell, CheckCheck, Megaphone, CreditCard
} from "lucide-react";
import { hasPermission, isAdminRole, type Permission } from "@shared/models/auth";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { AdminNotification } from "@shared/schema";

const navItems: { href: string; label: string; icon: any; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "manage_products" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "view_orders" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "view_customers" },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen, permission: "manage_categories" },
  { href: "/admin/coupons", label: "Coupons", icon: Tag, permission: "manage_coupons" },
  { href: "/admin/banners", label: "Sale Banner", icon: Megaphone, permission: "manage_products" },
  { href: "/admin/payment-settings", label: "Payment Settings", icon: CreditCard, permission: "manage_products" },
  { href: "/admin/delivery", label: "Delivery", icon: Truck, permission: "manage_delivery" },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw, permission: "manage_orders" },
  { href: "/admin/emails", label: "Emails", icon: Mail, permission: "manage_customers" },
  { href: "/admin/roles", label: "Roles", icon: Shield, permission: "manage_roles" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "view_dashboard" },
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
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Ravindrra Vastra Niketan" className="h-9 w-9 object-contain" data-testid="img-admin-sidebar-logo" />
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

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { data } = useQuery<{ notifications: AdminNotification[]; unreadCount: number }>({
    queryKey: ["/api/admin/notifications"],
    refetchInterval: 15000,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/notifications/mark-read/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  const timeAgo = (date: string | Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)} data-testid="button-admin-notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white" data-testid="badge-notification-count">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-background shadow-lg z-50" data-testid="dropdown-notifications">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-[#C9A961] hover:underline"
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-[#C9A961]/5" : ""}`}
                  onClick={() => {
                    if (!n.isRead) markRead.mutate(n.id);
                    if (n.orderId) {
                      navigate("/admin/orders");
                      setOpen(false);
                    }
                  }}
                  data-testid={`notification-item-${n.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.isRead ? "bg-[#C9A961]" : "bg-transparent"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.createdAt ? timeAgo(n.createdAt) : ""}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
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
          <header className="flex items-center justify-between p-3 border-b">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
