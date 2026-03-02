import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { isAdminRole } from "@shared/models/auth";
import { useQuery } from "@tanstack/react-query";
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
import AdminAnalytics from "@/pages/admin/analytics";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminCategories from "@/pages/admin/categories";
import AdminCoupons from "@/pages/admin/coupons";
import AdminDelivery from "@/pages/admin/delivery";
import AdminRoles from "@/pages/admin/roles";
import AdminEmails from "@/pages/admin/emails";
import AdminReturns from "@/pages/admin/returns";
import AdminBanners from "@/pages/admin/banners";
import AdminPaymentSettings from "@/pages/admin/payment-settings";
import AdminSiteSettings from "@/pages/admin/site-settings";
import AdminCustomerDetail from "@/pages/admin/customer-detail";
import MaintenancePage from "@/pages/maintenance";
import ReturnPolicyPage from "@/pages/return-policy";
import TermsConditionsPage from "@/pages/terms-conditions";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import ShippingDeliveryPage from "@/pages/shipping-delivery";
import TrackOrderPage from "@/pages/track-order";
import ContactPage from "@/pages/contact";
import FAQPage from "@/pages/faq";
import FlashSalePage from "@/pages/flash-sale";
import WishlistPage from "@/pages/wishlist";
import NewsletterPopup from "@/components/newsletter-popup";

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
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers/:id" component={AdminCustomerDetail} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/coupons" component={AdminCoupons} />
        <Route path="/admin/delivery" component={AdminDelivery} />
        <Route path="/admin/emails" component={AdminEmails} />
        <Route path="/admin/returns" component={AdminReturns} />
        <Route path="/admin/banners" component={AdminBanners} />
        <Route path="/admin/payment-settings" component={AdminPaymentSettings} />
        <Route path="/admin/site-settings" component={AdminSiteSettings} />
        <Route path="/admin/roles" component={AdminRoles} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: maintenance } = useQuery<{ enabled: boolean; title: string; message: string }>({
    queryKey: ["/api/maintenance"],
    refetchInterval: 60000,
  });

  const userRole = (user as any)?.role || ((user as any)?.isAdmin ? "super_admin" : "customer");
  const isAdmin = user && isAdminRole(userRole);

  if (maintenance?.enabled && !isAdmin) {
    return <MaintenancePage title={maintenance.title} message={maintenance.message} />;
  }
  return <>{children}</>;
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
    <MaintenanceGate>
      <MainLayout>
        <Switch>
          <Route path="/" component={HomeOrLanding} />
          <Route path="/shop" component={ShopPage} />
          <Route path="/flash-sale" component={FlashSalePage} />
          <Route path="/product/:slug" component={ProductDetailPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/payment/callback" component={PaymentCallbackPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/track-order" component={TrackOrderPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/return-policy" component={ReturnPolicyPage} />
          <Route path="/terms-conditions" component={TermsConditionsPage} />
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/shipping-delivery" component={ShippingDeliveryPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/faq" component={FAQPage} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    </MaintenanceGate>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <NewsletterPopup />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
