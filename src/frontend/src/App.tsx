import { OrderModal } from "@/components/OrderModal";
import { Toaster } from "@/components/ui/sonner";
import { useGetProducts, useIsAdmin, usePlaceOrder } from "@/hooks/useQueries";
import { AdminPanel } from "@/pages/AdminPanel";
import { Storefront } from "@/pages/Storefront";
import type { OrderModalState, Product } from "@/types";
import { mapProduct } from "@/utils/mappers";
import { useCallback, useEffect, useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  // Hash-based routing
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const isAdminRoute =
    hash === "#/admin" || hash === "#admin" || hash === "admin";

  const [orderModal, setOrderModal] = useState<OrderModalState>({
    open: false,
    product: null,
  });

  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const isLoggedIn = !!identity;

  // Backend data
  const { data: backendProducts = [], isLoading: productsLoading } =
    useGetProducts();
  const { data: isAdmin = false, isLoading: adminCheckLoading } = useIsAdmin();

  const placeOrderMutation = usePlaceOrder();

  // Map backend products to frontend shape
  const products: Product[] = backendProducts.map(mapProduct);

  // Open/close order modal — requires login
  const handleOpenOrderModal = useCallback((product: Product) => {
    setOrderModal({ open: true, product });
  }, []);

  const handleCloseOrderModal = useCallback(() => {
    setOrderModal({ open: false, product: null });
  }, []);

  return (
    <>
      {isAdminRoute ? (
        <AdminPanel
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          isInitializing={isInitializing || adminCheckLoading}
          onNavigateStorefront={() => {
            window.location.hash = "#/";
          }}
        />
      ) : (
        <Storefront
          products={products}
          isLoading={productsLoading}
          onOrder={handleOpenOrderModal}
          isLoggedIn={isLoggedIn}
          isLoggingIn={isLoggingIn}
          onLogin={login}
          onLogout={clear}
        />
      )}

      <OrderModal
        open={orderModal.open}
        product={orderModal.product}
        onClose={handleCloseOrderModal}
        placeOrderMutation={placeOrderMutation}
      />

      <Toaster position="top-right" richColors />
    </>
  );
}
