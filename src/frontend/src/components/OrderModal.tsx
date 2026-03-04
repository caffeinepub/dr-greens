import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PlaceOrderParams } from "@/hooks/useQueries";
import type { CustomerProfile, Product } from "@/types";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Leaf,
  ShoppingBasket,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  placeOrderMutation: UseMutationResult<bigint, Error, PlaceOrderParams>;
  customerProfile?: CustomerProfile | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  quantity: number;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  quantity?: string;
}

const defaultForm: FormState = {
  name: "",
  email: "",
  phone: "",
  quantity: 1,
  notes: "",
};

function validateForm(form: FormState, maxQty: number): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  if (form.quantity < 1) errors.quantity = "Minimum 1 tray.";
  if (form.quantity > maxQty)
    errors.quantity = `Only ${maxQty} trays in stock.`;
  return errors;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface ConfirmedOrderInfo {
  orderNumber: string;
  productName: string;
  quantity: number;
  total: number;
  customerName: string;
}

type Step = "form" | "otp" | "success";

/** Prominent "Cash on Delivery Only" badge */
function CashOnDeliveryBadge() {
  return (
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
  );
}

export function OrderModal({
  open,
  product,
  onClose,
  placeOrderMutation,
  customerProfile,
}: OrderModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<Step>("form");
  const [generatedOTP, setGeneratedOTP] = useState<string>("");
  const [enteredOTP, setEnteredOTP] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] =
    useState<ConfirmedOrderInfo | null>(null);

  // Pre-fill form from customer profile whenever modal opens
  useEffect(() => {
    if (open && customerProfile) {
      setForm((prev) => ({
        ...prev,
        name: customerProfile.name || prev.name,
        email: customerProfile.email || prev.email,
        phone: customerProfile.phone || prev.phone,
      }));
    }
  }, [open, customerProfile]);

  const isSubmitting = placeOrderMutation.isPending;

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      handleClose();
    }
  }

  function handleClose() {
    setForm(defaultForm);
    setErrors({});
    setStep("form");
    setGeneratedOTP("");
    setEnteredOTP("");
    setOtpError(null);
    setConfirmedOrder(null);
    onClose();
  }

  function handleChange(field: keyof FormState, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    const validationErrors = validateForm(form, product.stock);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const orderId = await placeOrderMutation.mutateAsync({
        productId: BigInt(product.id),
        customerName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        quantity: BigInt(form.quantity),
        notes: form.notes.trim(),
      });

      const otp = generateOTP();
      setGeneratedOTP(otp);
      setConfirmedOrder({
        orderNumber: orderId.toString(),
        productName: product.name,
        quantity: form.quantity,
        total: product.price * form.quantity,
        customerName: form.name.trim(),
      });
      setStep("otp");
      toast.success("Order placed! Please confirm with your OTP code.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order.";
      toast.error(message);
    }
  }

  function handleOTPConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (enteredOTP.trim() === generatedOTP) {
      setOtpError(null);
      setStep("success");
    } else {
      setOtpError("Incorrect code. Please try again.");
    }
  }

  if (!product) return null;

  const total = product.price * form.quantity;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="order_modal.dialog"
        className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border-border"
      >
        {/* Header strip */}
        <div className="bg-primary px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-primary-foreground/80" />
              <span className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-widest">
                Dr. Greens
              </span>
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-primary-foreground">
              {step === "success"
                ? "Order Confirmed!"
                : step === "otp"
                  ? "Confirm Your Order"
                  : product.name}
            </DialogTitle>
            {step === "form" && (
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                ₹{product.price} {product.unit}
              </p>
            )}
            {step === "otp" && (
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                Enter the confirmation code below
              </p>
            )}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {step === "success" && confirmedOrder ? (
              /* ── Step 3: Success ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                data-ocid="order_modal.success_state"
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                  Thank you, {confirmedOrder.customerName.split(" ")[0]}!
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Your order has been confirmed. We'll contact you soon for
                  delivery.
                </p>

                <div className="bg-secondary rounded-xl p-4 text-left space-y-2.5 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-semibold text-foreground">
                      #{confirmedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium text-foreground">
                      {confirmedOrder.productName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium text-foreground">
                      {confirmedOrder.quantity} tray
                      {confirmedOrder.quantity > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2.5">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="font-bold text-primary text-base">
                      ₹{confirmedOrder.total}
                    </span>
                  </div>
                </div>

                {/* COD reminder */}
                <div className="mb-5">
                  <CashOnDeliveryBadge />
                </div>

                <Button
                  data-ocid="order_modal.close_button"
                  onClick={handleClose}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                >
                  Done
                </Button>
              </motion.div>
            ) : step === "otp" ? (
              /* ── Step 2: OTP Confirmation ── */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* OTP display */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your confirmation code is:
                  </p>
                  <div className="font-mono text-5xl font-black text-primary tracking-[0.3em] mb-3">
                    {generatedOTP}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Share this code with our delivery agent to confirm you
                    received your order.
                  </p>
                </div>

                {/* Cash on Delivery badge */}
                <CashOnDeliveryBadge />

                {/* OTP input form */}
                <form onSubmit={handleOTPConfirm} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="otp-input"
                      className="text-sm font-semibold"
                    >
                      Enter Confirmation Code
                    </Label>
                    <Input
                      id="otp-input"
                      data-ocid="order_modal.otp_input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={enteredOTP}
                      onChange={(e) => {
                        setEnteredOTP(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                        if (otpError) setOtpError(null);
                      }}
                      className={`rounded-xl text-center text-2xl font-bold tracking-widest h-14 ${
                        otpError ? "border-destructive" : ""
                      }`}
                      autoFocus
                    />
                    {otpError && (
                      <div
                        data-ocid="order_modal.otp_error_state"
                        className="flex items-center gap-2 text-destructive text-sm"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {otpError}
                      </div>
                    )}
                  </div>

                  <Button
                    data-ocid="order_modal.otp_confirm_button"
                    type="submit"
                    disabled={enteredOTP.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold h-11 gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Order
                  </Button>
                </form>
              </motion.div>
            ) : (
              /* ── Step 1: Order Form ── */
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="order-name" className="text-sm font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="order-name"
                    data-ocid="order_modal.name_input"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`rounded-xl ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p
                      data-ocid="order_modal.error_state"
                      className="text-destructive text-xs"
                    >
                      {errors.name}
                    </p>
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
                    data-ocid="order_modal.email_input"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="rahul@example.com"
                    className={`rounded-xl ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email}</p>
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
                    data-ocid="order_modal.phone_input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`rounded-xl ${errors.phone ? "border-destructive" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <Label htmlFor="order-qty" className="text-sm font-semibold">
                    Quantity (trays)
                  </Label>
                  <Input
                    id="order-qty"
                    data-ocid="order_modal.quantity_input"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={form.quantity}
                    onChange={(e) =>
                      handleChange(
                        "quantity",
                        Number.parseInt(e.target.value, 10) || 1,
                      )
                    }
                    className={`rounded-xl ${errors.quantity ? "border-destructive" : ""}`}
                  />
                  {errors.quantity && (
                    <p className="text-destructive text-xs">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="order-notes"
                    className="text-sm font-semibold"
                  >
                    Order Notes{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="order-notes"
                    data-ocid="order_modal.notes_textarea"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Delivery instructions, special requests..."
                    rows={2}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Total */}
                <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Order Total
                  </span>
                  <span className="text-xl font-display font-bold text-primary">
                    ₹{total}
                  </span>
                </div>

                {/* Cash on Delivery badge */}
                <CashOnDeliveryBadge />

                {/* Submit */}
                <Button
                  data-ocid="order_modal.submit_button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl gap-2 h-11 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        role="img"
                        aria-label="Loading"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Placing Order…
                    </span>
                  ) : (
                    <>
                      <ShoppingBasket className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
