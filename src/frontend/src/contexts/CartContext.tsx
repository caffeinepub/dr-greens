import type { Product } from "@/types";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  itemCount: number;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const CART_KEY = "verdant_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartCtx = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  // Persist whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i,
        );
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock) }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, qty: number) => {
      if (qty <= 0) {
        removeFromCart(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(qty, i.product.stock) }
            : i,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Computed values
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const itemCount = items.length;

  return (
    <CartCtx.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        itemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
