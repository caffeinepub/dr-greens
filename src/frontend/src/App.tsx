import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useGetProducts } from "@/hooks/useQueries";
import { AdminApp } from "@/pages/AdminApp";
import { Storefront } from "@/pages/Storefront";
import type { CustomerProfile, Product } from "@/types";
import { mapProduct } from "@/utils/mappers";
import { useCallback, useEffect, useState } from "react";

type ActiveTab = "shop" | "my-orders";

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash;
}

// ─── Customer App ───────────────────────────────────────────────────────────

function CustomerApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("shop");
  const [cartOpen, setCartOpen] = useState(false);

  const {
    user,
    isLoggedIn,
    login,
    logout,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  } = useLocalAuth();

  // Backend data — loads for everyone (no login required to browse)
  const { data: backendProducts = [], isLoading: productsLoading } =
    useGetProducts();

  // Map backend products to frontend shape
  const products: Product[] = backendProducts.map(mapProduct);

  // Map local user to CustomerProfile shape
  const customerProfile: CustomerProfile | null = user
    ? {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        googleMapsLink: user.googleMapsLink,
      }
    : null;

  function handleLoginComplete(userData: Parameters<typeof login>[0]) {
    login(userData);
  }

  function handleLogout() {
    logout();
    setActiveTab("shop");
  }

  // Order Again handler: open cart drawer
  const handleOrderAgain = useCallback(
    (productId: number, _productName: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setActiveTab("shop");
        setTimeout(() => {
          setCartOpen(true);
        }, 100);
      }
    },
    [products],
  );

  return (
    <CartProvider>
      <Storefront
        products={products}
        isLoading={productsLoading}
        isLoggedIn={isLoggedIn}
        onLogin={openLoginModal}
        onLogout={handleLogout}
        customerName={user?.name}
        customerEmail={user?.email ?? ""}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOrderAgain={handleOrderAgain}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogin={() => {
          setCartOpen(false);
          openLoginModal();
        }}
        customerProfile={customerProfile}
      />

      <LoginModal
        open={showLoginModal}
        onClose={closeLoginModal}
        onLogin={handleLoginComplete}
        existingUser={user}
      />

      <Toaster position="top-right" richColors />
    </CartProvider>
  );
}

// ─── App Router ─────────────────────────────────────────────────────────────

export default function App() {
  const hash = useHashRoute();

  // Render admin app for all /admin routes
  if (hash.startsWith("#/admin")) {
    return <AdminApp />;
  }

  return <CustomerApp />;
}
