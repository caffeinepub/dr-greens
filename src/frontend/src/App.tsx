import { LoginModal } from "@/components/LoginModal";
import { OrderModal } from "@/components/OrderModal";
import { Toaster } from "@/components/ui/sonner";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useGetProducts, usePlaceOrder } from "@/hooks/useQueries";
import { AdminApp } from "@/pages/AdminApp";
import { Storefront } from "@/pages/Storefront";
import type { CustomerProfile, OrderModalState, Product } from "@/types";
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
  const [orderModal, setOrderModal] = useState<OrderModalState>({
    open: false,
    product: null,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("shop");

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

  const placeOrderMutation = usePlaceOrder();

  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

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

  // Open order modal — requires login
  const handleOpenOrderModal = useCallback(
    (product: Product) => {
      if (!isLoggedIn) {
        openLoginModal();
        // Store which product was clicked so we can open order after login
        setPendingProduct(product);
        return;
      }
      setOrderModal({ open: true, product });
    },
    [isLoggedIn, openLoginModal],
  );

  const handleCloseOrderModal = useCallback(() => {
    setOrderModal({ open: false, product: null });
  }, []);

  function handleLoginComplete(userData: Parameters<typeof login>[0]) {
    login(userData);
    // If user was trying to order a product, open the order modal now
    if (pendingProduct) {
      setOrderModal({ open: true, product: pendingProduct });
      setPendingProduct(null);
    }
  }

  function handleLogout() {
    logout();
    setActiveTab("shop");
  }

  // Order Again handler: look up product by id and open modal
  const handleOrderAgain = useCallback(
    (productId: number, _productName: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setActiveTab("shop");
        // Give time to switch tab before opening modal
        setTimeout(() => {
          handleOpenOrderModal(product);
        }, 100);
      }
    },
    [products, handleOpenOrderModal],
  );

  return (
    <>
      <Storefront
        products={products}
        isLoading={productsLoading}
        onOrder={handleOpenOrderModal}
        isLoggedIn={isLoggedIn}
        onLogin={openLoginModal}
        onLogout={handleLogout}
        customerName={user?.name}
        customerEmail={user?.email ?? ""}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOrderAgain={handleOrderAgain}
      />

      <OrderModal
        open={orderModal.open}
        product={orderModal.product}
        onClose={handleCloseOrderModal}
        placeOrderMutation={placeOrderMutation}
        customerProfile={customerProfile}
      />

      <LoginModal
        open={showLoginModal}
        onClose={closeLoginModal}
        onLogin={handleLoginComplete}
        existingUser={user}
      />

      <Toaster position="top-right" richColors />
    </>
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
