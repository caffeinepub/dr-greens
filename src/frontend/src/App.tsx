import { LoginModal } from "@/components/LoginModal";
import { OrderModal } from "@/components/OrderModal";
import { Toaster } from "@/components/ui/sonner";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useGetProducts, usePlaceOrder } from "@/hooks/useQueries";
import { Storefront } from "@/pages/Storefront";
import type { CustomerProfile, OrderModalState, Product } from "@/types";
import { mapProduct } from "@/utils/mappers";
import { useCallback, useState } from "react";

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [orderModal, setOrderModal] = useState<OrderModalState>({
    open: false,
    product: null,
  });

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

  return (
    <>
      <Storefront
        products={products}
        isLoading={productsLoading}
        onOrder={handleOpenOrderModal}
        isLoggedIn={isLoggedIn}
        onLogin={openLoginModal}
        onLogout={logout}
        customerName={user?.name}
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
