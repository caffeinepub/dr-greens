import { useCart } from "@/contexts/CartContext";
import { usePlaceOrder } from "@/hooks/useQueries";
import type { CustomerProfile } from "@/types";
import { FALLBACK_IMAGE } from "@/utils/mappers";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Leaf,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Textarea } from "./ui/textarea";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DELIVERY_SLOTS = [
  { value: "Morning (7–11am)", label: "Morning", sub: "7:00am – 11:00am" },
  { value: "Afternoon (12–4pm)", label: "Afternoon", sub: "12:00pm – 4:00pm" },
  { value: "Evening (5–8pm)", label: "Evening", sub: "5:00pm – 8:00pm" },
];

function getDeliveryDateOptions() {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
    options.push({ value: iso, label });
  }
  return options;
}

function getBulkDiscount(totalItems: number): {
  percent: number;
  label: string;
} {
  if (totalItems >= 5) return { percent: 15, label: "15% Bulk Discount" };
  if (totalItems >= 3) return { percent: 10, label: "10% Bulk Discount" };
  return { percent: 0, label: "" };
}

function getItemDiscount(qty: number): { percent: number; label: string } {
  if (qty >= 5) return { percent: 15, label: "15% off" };
  if (qty >= 3) return { percent: 10, label: "10% off" };
  return { percent: 0, label: "" };
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: string;
  deliveryDate: string;
  deliverySlot: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  deliveryDate?: string;
  deliverySlot?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  if (!form.deliveryDate)
    errors.deliveryDate = "Please select a delivery date.";
  if (!form.deliverySlot) errors.deliverySlot = "Please select a time slot.";
  return errors;
}

interface SuccessInfo {
  orderNumbers: string[];
  customerName: string;
  deliveryDate: string;
  deliverySlot: string;
  total: number;
  discountPercent: number;
  discountAmount: number;
  otp: string;
}

type DrawerView = "cart" | "order" | "success";

// ─── CartDrawer ───────────────────────────────────────────────────────────────

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onCheckout?: () => void; // kept for backward compat, no longer used
  customerProfile?: CustomerProfile | null;
}

export function CartDrawer({
  open,
  onClose,
  isLoggedIn,
  onLogin,
  customerProfile,
}: CartDrawerProps) {
  const {
    items,
    totalItems,
    totalPrice,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const placeOrderMutation = usePlaceOrder();
  const deliveryDateOptions = getDeliveryDateOptions();

  // View state
  const [view, setView] = useState<DrawerView>("cart");

  // Form state
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    deliveryDate: "",
    deliverySlot: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  // Discount calculations
  const cartDiscount = getBulkDiscount(totalItems);
  const discountAmount = totalPrice * (cartDiscount.percent / 100);
  const finalTotal = totalPrice - discountAmount;

  // Pre-fill form from customer profile when entering order view
  useEffect(() => {
    if (view === "order" && customerProfile) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || customerProfile.name || "",
        email: prev.email || customerProfile.email || "",
        phone: prev.phone || customerProfile.phone || "",
      }));
    }
  }, [view, customerProfile]);

  // Reset when drawer closes
  useEffect(() => {
    if (!open) {
      // Small delay so animation completes first
      const timer = setTimeout(() => {
        setView("cart");
        setForm({
          name: "",
          email: "",
          phone: "",
          deliveryDate: "",
          deliverySlot: "",
          notes: "",
        });
        setErrors({});
        setSuccessInfo(null);
        setIsPlacing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleProceedToOrder() {
    if (!isLoggedIn) {
      onLogin();
      return;
    }
    // Pre-fill from profile
    if (customerProfile) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || customerProfile.name || "",
        email: prev.email || customerProfile.email || "",
        phone: prev.phone || customerProfile.phone || "",
      }));
    }
    setView("order");
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsPlacing(true);
    const orderNumbers: string[] = [];
    try {
      for (const item of items) {
        const orderId = await placeOrderMutation.mutateAsync({
          productId: BigInt(item.product.id),
          customerName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          quantity: BigInt(item.quantity),
          notes: form.notes.trim(),
          deliveryDate: form.deliveryDate,
          deliverySlot: form.deliverySlot,
        });
        orderNumbers.push(orderId.toString());
      }
      const otp = generateOTP();
      setSuccessInfo({
        orderNumbers,
        customerName: form.name.trim(),
        deliveryDate: form.deliveryDate,
        deliverySlot: form.deliverySlot,
        total: finalTotal,
        discountPercent: cartDiscount.percent,
        discountAmount,
        otp,
      });
      setView("success");
      toast.success("Order placed successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order.";
      toast.error(message);
    } finally {
      setIsPlacing(false);
    }
  }

  function handleDone() {
    clearCart();
    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════════════════
              CART VIEW
          ══════════════════════════════════════════════════════════════════ */}
          {view === "cart" && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-display text-xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                    </div>
                    Your Cart
                    {totalItems > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs font-bold h-5 px-1.5 ml-1">
                        {totalItems}
                      </Badge>
                    )}
                  </SheetTitle>
                  <button
                    type="button"
                    data-ocid="cart.close_button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </SheetHeader>

              {/* Body */}
              {items.length === 0 ? (
                <div
                  data-ocid="cart.empty_state"
                  className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center">
                    <ShoppingCart className="w-7 h-7 text-primary/50" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add some microgreens to get started!
                    </p>
                  </div>
                  <Button
                    data-ocid="cart.browse_button"
                    onClick={onClose}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 mt-2"
                  >
                    <Leaf className="w-4 h-4" />
                    Browse Products
                  </Button>
                </div>
              ) : (
                <>
                  {/* Items list */}
                  <ScrollArea className="flex-1 px-5">
                    <div className="py-4 space-y-4">
                      <AnimatePresence initial={false}>
                        {items.map((item, idx) => {
                          const lineTotal = item.product.price * item.quantity;
                          const itemDiscount = getItemDiscount(item.quantity);

                          return (
                            <motion.div
                              key={item.product.id}
                              data-ocid={`cart.item.${idx + 1}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex gap-3 bg-card rounded-xl border border-border p-3">
                                {/* Product image */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                                  <img
                                    src={item.product.image || FALLBACK_IMAGE}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const t = e.currentTarget;
                                      t.onerror = null;
                                      t.src = FALLBACK_IMAGE;
                                    }}
                                  />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1 mb-1">
                                    <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
                                      {item.product.name}
                                    </h3>
                                    <button
                                      type="button"
                                      data-ocid={`cart.delete_button.${idx + 1}`}
                                      onClick={() =>
                                        removeFromCart(item.product.id)
                                      }
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 ml-1"
                                      aria-label={`Remove ${item.product.name}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    {/* Price + discount */}
                                    <div>
                                      <span className="text-xs text-muted-foreground">
                                        ₹{item.product.price}{" "}
                                        {item.product.unit}
                                      </span>
                                      {itemDiscount.percent > 0 && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <Tag className="w-2.5 h-2.5 text-emerald-600" />
                                          <span className="text-xs text-emerald-600 font-semibold">
                                            {itemDiscount.label}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        data-ocid={`cart.quantity_minus.${idx + 1}`}
                                        onClick={() =>
                                          updateQuantity(
                                            item.product.id,
                                            item.quantity - 1,
                                          )
                                        }
                                        className="w-6 h-6 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-sm font-bold text-foreground w-6 text-center">
                                        {item.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        data-ocid={`cart.quantity_plus.${idx + 1}`}
                                        onClick={() =>
                                          updateQuantity(
                                            item.product.id,
                                            item.quantity + 1,
                                          )
                                        }
                                        disabled={
                                          item.quantity >= item.product.stock
                                        }
                                        className="w-6 h-6 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        aria-label="Increase quantity"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Line total */}
                                  <div className="flex justify-end mt-1.5">
                                    <span className="text-sm font-display font-bold text-primary">
                                      ₹{lineTotal.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Bulk discount hints */}
                    {totalItems < 5 && (
                      <div className="pb-4">
                        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
                          <p className="text-xs text-amber-700 font-medium">
                            {totalItems < 3 ? (
                              <>
                                Add <strong>{3 - totalItems} more tray</strong>{" "}
                                for <strong>10% off</strong>!
                              </>
                            ) : (
                              <>
                                Add <strong>{5 - totalItems} more tray</strong>{" "}
                                for <strong>15% off</strong>!
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Footer */}
                  <div className="flex-shrink-0 border-t border-border px-5 py-4 space-y-3">
                    {/* Price breakdown */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Subtotal ({totalItems} tray
                          {totalItems !== 1 ? "s" : ""})
                        </span>
                        <span className="text-foreground font-medium">
                          ₹{totalPrice.toFixed(2)}
                        </span>
                      </div>
                      {cartDiscount.percent > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            {cartDiscount.label}
                          </span>
                          <span className="font-semibold">
                            -₹{discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <Separator className="my-1" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">
                          Total
                        </span>
                        <span className="font-display text-xl font-bold text-primary">
                          ₹{finalTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Cash on Delivery badge */}
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <span className="text-amber-600 text-xs font-bold uppercase tracking-wide">
                        💵 Cash on Delivery Only
                      </span>
                    </div>

                    {/* CTA */}
                    {isLoggedIn ? (
                      <Button
                        data-ocid="cart.place_order_button"
                        onClick={handleProceedToOrder}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl h-11 gap-2 transition-all hover:scale-[1.02]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Proceed to Place Order · ₹{finalTotal.toFixed(2)}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          data-ocid="cart.signin_button"
                          onClick={onLogin}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 gap-2"
                        >
                          Sign in to Order
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          Sign in to place your order
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ORDER VIEW — inline checkout form
          ══════════════════════════════════════════════════════════════════ */}
          {view === "order" && (
            <motion.div
              key="order"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Sticky header */}
              <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0 bg-card/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-ocid="cart.order_back_button"
                    onClick={() => setView("cart")}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Back to cart"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Place Order
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {items.length} item{items.length !== 1 ? "s" : ""} · ₹
                      {finalTotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable form body */}
              <ScrollArea className="flex-1">
                <form
                  id="place-order-form"
                  onSubmit={handlePlaceOrder}
                  className="px-5 py-5 space-y-5"
                >
                  {/* Order summary */}
                  <div className="bg-secondary/60 rounded-xl p-4 space-y-2 border border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Order Summary
                    </p>
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {item.product.name}{" "}
                          <span className="text-muted-foreground">
                            × {item.quantity}
                          </span>
                        </span>
                        <span className="font-medium text-foreground">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {cartDiscount.percent > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 pt-1.5 border-t border-border/60">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {cartDiscount.label}
                        </span>
                        <span className="font-semibold">
                          -₹{discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-1.5 border-t border-border/60">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-display font-bold text-primary text-base">
                        ₹{finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="order-name"
                      className="text-sm font-semibold"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="order-name"
                      data-ocid="cart.order_name_input"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      autoComplete="name"
                      className={`rounded-xl ${errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="order-email"
                      className="text-sm font-semibold"
                    >
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="order-email"
                      data-ocid="cart.order_email_input"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="rahul@example.com"
                      autoComplete="email"
                      className={`rounded-xl ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    />
                    {errors.email && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="order-phone"
                      className="text-sm font-semibold"
                    >
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="order-phone"
                      data-ocid="cart.order_phone_input"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      className={`rounded-xl ${errors.phone ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    />
                    {errors.phone && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* Delivery Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="order-date"
                      className="text-sm font-semibold flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Delivery Date <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.deliveryDate}
                      onValueChange={(val) => handleChange("deliveryDate", val)}
                    >
                      <SelectTrigger
                        id="order-date"
                        data-ocid="cart.order_delivery_date.select"
                        className={`rounded-xl ${errors.deliveryDate ? "border-destructive" : ""}`}
                      >
                        <SelectValue placeholder="Choose a date…" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryDateOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.deliveryDate && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.deliveryDate}
                      </div>
                    )}
                  </div>

                  {/* Time Slot */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Time Slot <span className="text-destructive">*</span>
                    </Label>
                    <div
                      data-ocid="cart.order_delivery_slot.toggle"
                      className="grid grid-cols-3 gap-2"
                    >
                      {DELIVERY_SLOTS.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() =>
                            handleChange("deliverySlot", slot.value)
                          }
                          className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all text-xs font-semibold
                            ${
                              form.deliverySlot === slot.value
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            }`}
                        >
                          <span className="font-bold text-sm">
                            {slot.label}
                          </span>
                          <span className="opacity-75 mt-0.5">{slot.sub}</span>
                        </button>
                      ))}
                    </div>
                    {errors.deliverySlot && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.deliverySlot}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="order-notes"
                      className="text-sm font-semibold"
                    >
                      Notes{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="order-notes"
                      data-ocid="cart.order_notes_textarea"
                      value={form.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Delivery instructions, special requests..."
                      rows={2}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  {/* Cash on Delivery */}
                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
                    <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        Payment Method
                      </span>
                      <p className="text-sm font-semibold text-amber-900 leading-tight">
                        Cash on Delivery Only
                      </p>
                    </div>
                  </div>
                </form>
              </ScrollArea>

              {/* Sticky submit footer */}
              <div className="flex-shrink-0 border-t border-border px-5 py-4">
                <Button
                  data-ocid="cart.order_submit_button"
                  type="submit"
                  form="place-order-form"
                  disabled={isPlacing}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl h-11 gap-2 transition-all"
                >
                  {isPlacing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing Orders…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Place Order · ₹{finalTotal.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SUCCESS VIEW — confirmation + OTP
          ══════════════════════════════════════════════════════════════════ */}
          {view === "success" && successInfo && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              data-ocid="cart.order_success_state"
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0 bg-primary text-primary-foreground">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary-foreground/70" />
                    <span className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest">
                      Verdant Greens
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDone}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h2 className="font-display text-2xl font-bold text-primary-foreground">
                  Order Confirmed! 🎉
                </h2>
              </div>

              {/* Body */}
              <ScrollArea className="flex-1">
                <div className="px-5 py-6 space-y-5">
                  {/* Greeting */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-9 h-9 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Thank you, {successInfo.customerName.split(" ")[0]}!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your order
                      {successInfo.orderNumbers.length > 1 ? "s have" : " has"}{" "}
                      been placed. We'll contact you soon.
                    </p>
                  </div>

                  {/* OTP Code — large & prominent */}
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Delivery Confirmation Code
                    </p>
                    <div
                      data-ocid="cart.otp_display"
                      className="font-mono text-5xl font-black text-primary tracking-[0.35em] mb-2 tabular-nums"
                    >
                      {successInfo.otp}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Share this code with your delivery agent to confirm
                      receipt.
                    </p>
                  </div>

                  {/* Order details */}
                  <div className="bg-secondary/60 rounded-xl p-4 text-sm space-y-2.5 border border-border/60">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Order{successInfo.orderNumbers.length > 1 ? "s" : ""} #
                      </span>
                      <span className="font-semibold text-foreground text-right">
                        {successInfo.orderNumbers
                          .map((n) => `#${n}`)
                          .join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium text-foreground">
                        {items.length} product{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium text-foreground text-right">
                        {successInfo.deliveryDate} · {successInfo.deliverySlot}
                      </span>
                    </div>
                    {successInfo.discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount ({successInfo.discountPercent}%)</span>
                        <span className="font-medium">
                          -₹{successInfo.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-bold text-primary text-base">
                        ₹{successInfo.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* COD badge */}
                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-amber-900">
                      Cash on Delivery Only
                    </p>
                  </div>
                </div>
              </ScrollArea>

              {/* Done button */}
              <div className="flex-shrink-0 border-t border-border px-5 py-4">
                <Button
                  data-ocid="cart.order_done_button"
                  onClick={handleDone}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
