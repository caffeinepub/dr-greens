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
import type { Product } from "@/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { CheckCircle2, Leaf, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  placeOrderMutation: UseMutationResult<bigint, Error, PlaceOrderParams>;
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

interface ConfirmedOrderInfo {
  orderNumber: string;
  productName: string;
  quantity: number;
  total: number;
  customerName: string;
}

export function OrderModal({
  open,
  product,
  onClose,
  placeOrderMutation,
}: OrderModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmedOrder, setConfirmedOrder] =
    useState<ConfirmedOrderInfo | null>(null);

  const isSubmitting = placeOrderMutation.isPending;

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      handleClose();
    }
  }

  function handleClose() {
    setForm(defaultForm);
    setErrors({});
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

      setConfirmedOrder({
        orderNumber: orderId.toString(),
        productName: product.name,
        quantity: form.quantity,
        total: product.price * form.quantity,
        customerName: form.name.trim(),
      });
      toast.success("Order placed! We'll be in touch soon.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order.";
      toast.error(message);
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
              {confirmedOrder ? "Order Confirmed!" : product.name}
            </DialogTitle>
            {!confirmedOrder && (
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                R{product.price} {product.unit}
              </p>
            )}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {confirmedOrder ? (
            /* Success state */
            <div
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
                Your order has been received. We'll contact you soon.
              </p>

              <div className="bg-secondary rounded-xl p-4 text-left space-y-2.5 mb-5 text-sm">
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
                    R{confirmedOrder.total}
                  </span>
                </div>
              </div>

              <Button
                data-ocid="order_modal.close_button"
                onClick={handleClose}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
              >
                Done
              </Button>
            </div>
          ) : (
            /* Order form */
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g. Sarah Johnson"
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
                <Label htmlFor="order-email" className="text-sm font-semibold">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="order-email"
                  data-ocid="order_modal.email_input"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="sarah@example.com"
                  className={`rounded-xl ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="order-phone" className="text-sm font-semibold">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="order-phone"
                  data-ocid="order_modal.phone_input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+27 71 234 5678"
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
                  <p className="text-destructive text-xs">{errors.quantity}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="order-notes" className="text-sm font-semibold">
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
                  R{total}
                </span>
              </div>

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
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
