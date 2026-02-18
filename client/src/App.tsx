import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
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
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import WhatsAppButton from "@/components/WhatsAppButton";

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
  return isAuthenticated ? <HomePage /> : <LandingPage />;
}

function AppRouter() {
  const [location] = useLocation();

  if (location === "/login") {
    return <LoginPage />;
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
        <Route path="/orders" component={OrdersPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
