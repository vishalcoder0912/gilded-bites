import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PageTransition from "@/components/PageTransition";
import RequireUser from "@/components/RequireUser";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminStock from "./pages/admin/AdminStock";
import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryLayout from "./pages/delivery/DeliveryLayout";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import DeliveryRequire from "./pages/delivery/DeliveryRequire";
import Addresses from "./pages/Addresses";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/products" element={<Navigate to="/shop" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/products/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/dashboard" element={<RequireUser><PageTransition><UserDashboard /></PageTransition></RequireUser>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/checkout" element={<RequireUser><PageTransition><Checkout /></PageTransition></RequireUser>} />
        <Route path="/order-confirmed" element={<RequireUser><PageTransition><OrderConfirmation /></PageTransition></RequireUser>} />
        <Route path="/orders" element={<RequireUser><PageTransition><Orders /></PageTransition></RequireUser>} />
        <Route path="/orders/:id" element={<RequireUser><PageTransition><OrderTracking /></PageTransition></RequireUser>} />
        <Route path="/order-tracking/:id" element={<RequireUser><PageTransition><OrderTracking /></PageTransition></RequireUser>} />
        <Route path="/addresses" element={<RequireUser><PageTransition><Addresses /></PageTransition></RequireUser>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/atelier" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
          <Route path="/admin/stock" element={<AdminLayout><AdminStock /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
        </Route>
        <Route path="/delivery/login" element={<PageTransition><DeliveryLogin /></PageTransition>} />
        <Route element={<DeliveryRequire />}>
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryDashboard />} />
            <Route path="orders" element={<DeliveryOrders />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const Shell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isDelivery = location.pathname.startsWith("/delivery");

  if (isAdmin || isDelivery) {
    return <AnimatedRoutes />;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
