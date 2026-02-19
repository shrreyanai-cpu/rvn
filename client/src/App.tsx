import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { isAdminRole } from "@shared/models/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import ShopPage from "@/pages/shop";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import OrdersPage from "@/pages/orders";
import SearchPage from "@/pages/search";
import LoginPage from "@/pages/login";
import PaymentCallbackPage from "@/pages/payment-callback";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import WhatsAppButton from "@/components/WhatsAppButton";
import AdminLayout from "@/pages/admin/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminCategories from "@/pages/admin/categories";
import AdminCoupons from "@/pages/admin/coupons";
import AdminDelivery from "@/pages/admin/delivery";
import AdminRoles from "@/pages/admin/roles";
import AdminCustomerDetail from "@/pages/admin/customer-detail";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function HomeOrLanding() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <HomePage />;
}

function AdminRouter() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userRole = (user as any)?.role || ((user as any)?.isAdmin ? "super_admin" : "customer");
  if (!isAuthenticated || !isAdminRole(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers/:id" component={AdminCustomerDetail} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/coupons" component={AdminCoupons} />
        <Route path="/admin/delivery" component={AdminDelivery} />
        <Route path="/admin/roles" component={AdminRoles} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function AppRouter() {
  const [location] = useLocation();

  if (location === "/login") {
    return <LoginPage />;
  }

  if (location.startsWith("/admin")) {
    return <AdminRouter />;
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={HomeOrLanding} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/product/:slug" component={ProductDetailPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/payment/callback" component={PaymentCallbackPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
