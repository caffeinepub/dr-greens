import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LocalUser } from "@/hooks/useLocalAuth";
import {
  ExternalLink,
  Leaf,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (user: LocalUser) => void;
  existingUser?: LocalUser | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  googleMapsLink: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  googleMapsLink?: string;
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
  if (!form.location.trim()) errors.location = "Delivery address is required.";
  if (
    form.googleMapsLink.trim() &&
    !/^https?:\/\//i.test(form.googleMapsLink.trim())
  ) {
    errors.googleMapsLink = "Please enter a valid URL starting with http(s)://";
  }
  return errors;
}

export function LoginModal({
  open,
  onClose,
  onLogin,
  existingUser,
}: LoginModalProps) {
  const [form, setForm] = useState<FormState>({
    name: existingUser?.name ?? "",
    email: existingUser?.email ?? "",
    phone: existingUser?.phone ?? "",
    location: existingUser?.location ?? "",
    googleMapsLink: existingUser?.googleMapsLink ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    // Simulate slight delay for better UX
    setTimeout(() => {
      onLogin({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        googleMapsLink: form.googleMapsLink.trim(),
      });
      setIsSubmitting(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        data-ocid="login.dialog"
        className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border-border"
      >
        {/* Green header */}
        <div className="bg-primary px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-widest">
                Dr. Greens
              </span>
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-primary-foreground">
              {existingUser ? "Update Your Details" : "Sign In to Order"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/75 text-sm mt-1.5 leading-relaxed">
              {existingUser
                ? "Update your delivery details below."
                : "Fill in your details to place orders. We'll use this to deliver your microgreens."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-name"
                className="text-sm font-semibold text-foreground"
              >
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-name"
                  data-ocid="login.name_input"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  className={`pl-9 rounded-xl ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p
                  data-ocid="login.error_state"
                  className="text-destructive text-xs"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-sm font-semibold text-foreground"
              >
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  data-ocid="login.email_input"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="sarah@example.com"
                  className={`pl-9 rounded-xl ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-phone"
                className="text-sm font-semibold text-foreground"
              >
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-phone"
                  data-ocid="login.phone_input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+27 71 234 5678"
                  className={`pl-9 rounded-xl ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-location"
                className="text-sm font-semibold text-foreground"
              >
                Delivery Address <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Your full delivery address — street, suburb, city, and postal
                code.
              </p>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Textarea
                  id="login-location"
                  data-ocid="login.location_textarea"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. 42 Main Road, Gardens, Cape Town, 8001"
                  rows={3}
                  className={`pl-9 rounded-xl resize-none ${errors.location ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.location && (
                <p className="text-destructive text-xs">{errors.location}</p>
              )}
            </div>

            {/* Google Maps Link */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-maps"
                className="text-sm font-semibold text-foreground"
              >
                Google Maps Link{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </Label>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Paste a Google Maps link to your location for accurate delivery.
              </p>
              <Input
                id="login-maps"
                data-ocid="login.maps_link_input"
                type="url"
                value={form.googleMapsLink}
                onChange={(e) => handleChange("googleMapsLink", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className={`rounded-xl ${errors.googleMapsLink ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.googleMapsLink && (
                <p className="text-destructive text-xs">
                  {errors.googleMapsLink}
                </p>
              )}
            </div>

            <div className="pt-1">
              <Button
                data-ocid="login.submit_button"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 gap-2 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <>
                    <Leaf className="w-4 h-4" />
                    {existingUser ? "Save Changes" : "Continue to Order"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
