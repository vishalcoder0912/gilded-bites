import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
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
import LenisScroll from "@/components/luxury/LenisScroll";
import GsapMouseEffects from "@/components/luxury/GsapMouseEffects";
import MouseSpotlight from "@/components/luxury/MouseSpotlight";
import ScrollNavbarWrapper from "@/components/luxury/ScrollNavbarWrapper";
import RouteGsapEnhancer from "@/components/luxury/RouteGsapEnhancer";
import { NoiseOverlay } from "@/components/luxury/MicroInteractions";
import SiteFrameSequenceBackground from "@/components/hero/SiteFrameSequenceBackground";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Cart = lazy(() => import("./pages/Cart"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const About = lazy(() => import("./pages/About"));
const Atelier = lazy(() => import("./pages/Atelier"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminStock = lazy(() => import("./pages/admin/AdminStock"));
const DeliveryLogin = lazy(() => import("./pages/delivery/DeliveryLogin"));
const DeliveryLayout = lazy(() => import("./pages/delivery/DeliveryLayout"));
const DeliveryDashboard = lazy(() => import("./pages/delivery/DeliveryDashboard"));
const DeliveryOrders = lazy(() => import("./pages/delivery/DeliveryOrders"));
const DeliveryRequire = lazy(() => import("./pages/delivery/DeliveryRequire"));
const Addresses = lazy(() => import("./pages/Addresses"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-label="Loading Noir Sane page" />
);

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
        <Route path="/atelier" element={<PageTransition><Atelier /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Legal type="privacy" /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Legal type="terms" /></PageTransition>} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
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
  const isPublic = !isAdmin && !isDelivery;
  const isHome = location.pathname === "/";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      {isHome ? <SiteFrameSequenceBackground /> : null}
      <RouteGsapEnhancer />

      <div className="relative z-20">
        {isPublic ? (
          <ScrollNavbarWrapper>
            <Navbar />
          </ScrollNavbarWrapper>
        ) : null}

        {isPublic ? <CartDrawer /> : null}

        <main className="relative z-10">
          <AnimatedRoutes />
        </main>

        {isPublic ? <Footer /> : null}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LenisScroll>
        <Toaster />
        <Sonner />
        <NoiseOverlay opacity={0.025} />
        <MouseSpotlight />
        <GsapMouseEffects />
        <div className="cinematic-vignette pointer-events-none fixed inset-0 z-[9999] opacity-50" />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Shell />
          </Suspense>
        </BrowserRouter>
      </LenisScroll>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
