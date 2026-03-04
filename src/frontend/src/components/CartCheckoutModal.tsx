import { useCart } from "@/contexts/CartContext";
import { usePlaceOrder } from "@/hooks/useQueries";
import type { CustomerProfile } from "@/types";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Leaf,
  Loader2,
  ShoppingCart,
  Tag,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Form state ───────────────────────────────────────────────────────────────

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

type Step = "form" | "otp" | "success";

interface SuccessInfo {
  orderNumbers: string[];
  customerName: string;
  deliveryDate: string;
  deliverySlot: string;
  total: number;
  discountPercent: number;
  discountAmount: number;
}

// ─── CartCheckoutModal ────────────────────────────────────────────────────────

interface CartCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  customerProfile?: CustomerProfile | null;
}

export function CartCheckoutModal({
  open,
  onClose,
  customerProfile,
}: CartCheckoutModalProps) {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const placeOrderMutation = usePlaceOrder();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    deliveryDate: "",
    deliverySlot: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<Step>("form");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [enteredOTP, setEnteredOTP] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const deliveryDateOptions = getDeliveryDateOptions();
  const discount = getBulkDiscount(totalItems);
  const discountAmount = totalPrice * (discount.percent / 100);
  const finalTotal = totalPrice - discountAmount;

  // Pre-fill from customer profile
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

  function handleClose() {
    if (step === "success") {
      clearCart();
    }
    setForm({
      name: "",
      email: "",
      phone: "",
      deliveryDate: "",
      deliverySlot: "",
      notes: "",
    });
    setErrors({});
    setStep("form");
    setGeneratedOTP("");
    setEnteredOTP("");
    setOtpError(null);
    setSuccessInfo(null);
    onClose();
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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
      setGeneratedOTP(otp);
      setSuccessInfo({
        orderNumbers,
        customerName: form.name.trim(),
        deliveryDate: form.deliveryDate,
        deliverySlot: form.deliverySlot,
        total: finalTotal,
        discountPercent: discount.percent,
        discountAmount,
      });
      setStep("otp");
      toast.success("Orders placed! Please confirm with your OTP code.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order.";
      toast.error(message);
    } finally {
      setIsPlacing(false);
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="checkout_modal.dialog"
        className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border-border max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-primary px-6 pt-6 pb-5 sticky top-0 z-10">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-primary-foreground/80" />
              <span className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-widest">
                Verdant Greens
              </span>
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-primary-foreground">
              {step === "success"
                ? "Order Confirmed!"
                : step === "otp"
                  ? "Confirm Your Order"
                  : "Checkout"}
            </DialogTitle>
            {step === "form" && (
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                {items.length} item{items.length !== 1 ? "s" : ""} · ₹
                {finalTotal.toFixed(2)}
              </p>
            )}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {/* ── Success step ── */}
            {step === "success" && successInfo ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                data-ocid="checkout_modal.success_state"
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                  Thank you, {successInfo.customerName.split(" ")[0]}!
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Your order
                  {successInfo.orderNumbers.length > 1 ? "s have" : " has"} been
                  confirmed. We'll contact you soon.
                </p>

                <div className="bg-secondary rounded-xl p-4 text-left space-y-2.5 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Order{successInfo.orderNumbers.length > 1 ? "s" : ""} #
                    </span>
                    <span className="font-semibold text-foreground text-right">
                      {successInfo.orderNumbers.map((n) => `#${n}`).join(", ")}
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
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="font-bold text-primary text-base">
                      ₹{successInfo.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 mb-5">
                  <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-900">
                    Cash on Delivery Only
                  </p>
                </div>

                <Button
                  data-ocid="checkout_modal.close_button"
                  onClick={handleClose}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                >
                  Done
                </Button>
              </motion.div>
            ) : step === "otp" ? (
              /* ── OTP step ── */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your confirmation code is:
                  </p>
                  <div className="font-mono text-5xl font-black text-primary tracking-[0.3em] mb-3">
                    {generatedOTP}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Share this code with our delivery agent to confirm receipt.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-900">
                    Cash on Delivery Only
                  </p>
                </div>

                <form onSubmit={handleOTPConfirm} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="checkout-otp-input"
                      className="text-sm font-semibold"
                    >
                      Enter Confirmation Code
                    </Label>
                    <Input
                      id="checkout-otp-input"
                      data-ocid="checkout_modal.otp_input"
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
                      className={`rounded-xl text-center text-2xl font-bold tracking-widest h-14 ${otpError ? "border-destructive" : ""}`}
                      autoFocus
                    />
                    {otpError && (
                      <div
                        data-ocid="checkout_modal.otp_error_state"
                        className="flex items-center gap-2 text-destructive text-sm"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {otpError}
                      </div>
                    )}
                  </div>
                  <Button
                    data-ocid="checkout_modal.otp_confirm_button"
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
              /* ── Form step ── */
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Order summary */}
                <div className="bg-secondary rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
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
                  {discount.percent > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 pt-1 border-t border-border">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {discount.label}
                      </span>
                      <span className="font-semibold">
                        -₹{discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-1 border-t border-border">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-display font-bold text-primary text-base">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="checkout-name"
                    className="text-sm font-semibold"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkout-name"
                    data-ocid="checkout_modal.name_input"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`rounded-xl ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p
                      data-ocid="checkout_modal.name_error_state"
                      className="text-destructive text-xs"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="checkout-email"
                    className="text-sm font-semibold"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkout-email"
                    data-ocid="checkout_modal.email_input"
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
                    htmlFor="checkout-phone"
                    className="text-sm font-semibold"
                  >
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkout-phone"
                    data-ocid="checkout_modal.phone_input"
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

                {/* Delivery Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="checkout-date"
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
                      id="checkout-date"
                      data-ocid="checkout_modal.delivery_date.select"
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
                    <p className="text-destructive text-xs">
                      {errors.deliveryDate}
                    </p>
                  )}
                </div>

                {/* Time Slot */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Time Slot <span className="text-destructive">*</span>
                  </Label>
                  <div
                    data-ocid="checkout_modal.delivery_slot.toggle"
                    className="grid grid-cols-3 gap-2"
                  >
                    {DELIVERY_SLOTS.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => handleChange("deliverySlot", slot.value)}
                        className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all text-xs font-semibold
                          ${
                            form.deliverySlot === slot.value
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                      >
                        <span className="font-bold text-sm">{slot.label}</span>
                        <span className="opacity-75 mt-0.5">{slot.sub}</span>
                      </button>
                    ))}
                  </div>
                  {errors.deliverySlot && (
                    <p className="text-destructive text-xs">
                      {errors.deliverySlot}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="checkout-notes"
                    className="text-sm font-semibold"
                  >
                    Notes{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="checkout-notes"
                    data-ocid="checkout_modal.notes_textarea"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Delivery instructions, special requests..."
                    rows={2}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Cash on Delivery badge */}
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

                {/* Submit */}
                <Button
                  data-ocid="checkout_modal.submit_button"
                  type="submit"
                  disabled={isPlacing}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl gap-2 h-11 transition-all"
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
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
