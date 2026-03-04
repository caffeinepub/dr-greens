import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import {
  type BackendBanner,
  useGetActiveBanners,
  useGetStoreSettings,
  useSubmitContactForm,
} from "@/hooks/useQueries";
import { MyOrders } from "@/pages/MyOrders";
import type { Product } from "@/types";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Heart,
  Leaf,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingCart,
  Sprout,
  Star,
  Store,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StorefrontProps {
  products: Product[];
  isLoading?: boolean;
  onOrder?: (product: Product) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  customerName?: string;
  customerEmail?: string;
  activeTab: "shop" | "my-orders";
  onTabChange: (tab: "shop" | "my-orders") => void;
  onOrderAgain?: (productId: number, productName: string) => void;
  onOpenCart?: () => void;
}

const FEATURES = [
  {
    icon: Leaf,
    title: "100% Organic",
    description: "Grown without pesticides or synthetic fertilisers.",
  },
  {
    icon: Sprout,
    title: "Harvested Fresh",
    description: "Cut and delivered within 24 hours of harvest.",
  },
  {
    icon: Heart,
    title: "Nutrient Dense",
    description: "Up to 40× more nutrients than mature vegetables.",
  },
  {
    icon: Star,
    title: "Chef's Choice",
    description: "Trusted by home cooks and professional kitchens alike.",
  },
];

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const defaultContactForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

function ContactSection() {
  const [form, setForm] = useState<ContactFormState>(defaultContactForm);
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = useSubmitContactForm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitMutation.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      setSubmitted(true);
      setForm(defaultContactForm);
      toast.success("Message sent! We'll get back to you shortly.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/40"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            <span className="h-px w-8 bg-primary/40 inline-block" />
            Get in Touch
            <span className="h-px w-8 bg-primary/40 inline-block" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Contact Us
          </h2>
          <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
            Have a question, special request, or want to place a bulk order?
            We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                We're here to help
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whether you're a first-time buyer or a regular customer, our
                team is ready to assist with any questions about our
                microgreens, delivery, or custom orders.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "Verdant Greens2026@gmail.com",
                  href: "mailto:Verdant Greens2026@gmail.com",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "Available on request",
                  href: null,
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "India",
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-foreground font-medium">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/8 border border-primary/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Bulk & Wholesale Orders
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We supply restaurants, cafés, and health stores with fresh
                    microgreens weekly. Contact us to discuss custom growing
                    schedules and pricing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {submitted ? (
              <div
                data-ocid="contact.success_state"
                className="h-full flex flex-col items-center justify-center text-center gap-5 bg-card rounded-2xl border border-border p-10 shadow-sm"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Thanks for reaching out. We'll get back to you within 24
                    hours.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="rounded-xl mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-name"
                    className="text-sm font-semibold"
                  >
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="contact-name"
                      data-ocid="contact.name_input"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      required
                      placeholder="Jane Smith"
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-email"
                    className="text-sm font-semibold"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="contact-email"
                      data-ocid="contact.email_input"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      required
                      placeholder="jane@example.com"
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-phone"
                    className="text-sm font-semibold"
                  >
                    Phone Number{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="contact-phone"
                      data-ocid="contact.phone_input"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+91 98765 43210"
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-message"
                    className="text-sm font-semibold"
                  >
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    data-ocid="contact.message_textarea"
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    placeholder="Tell us how we can help…"
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>

                <Button
                  data-ocid="contact.submit_button"
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-semibold gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Promo Banner Strip ─────────────────────────────────────────────────────

function PromoBannerStrip({ banners }: { banners: BackendBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem("dismissedBanners");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  const visibleBanners = banners.filter((b) => !dismissed.has(b.id.toString()));

  useEffect(() => {
    if (currentIndex >= visibleBanners.length && visibleBanners.length > 0) {
      setCurrentIndex(visibleBanners.length - 1);
    }
  }, [visibleBanners.length, currentIndex]);

  if (visibleBanners.length === 0) return null;

  const banner =
    visibleBanners[Math.min(currentIndex, visibleBanners.length - 1)];
  if (!banner) return null;

  function dismiss() {
    const newDismissed = new Set(dismissed);
    newDismissed.add(banner.id.toString());
    setDismissed(newDismissed);
    try {
      sessionStorage.setItem(
        "dismissedBanners",
        JSON.stringify([...newDismissed]),
      );
    } catch {
      // ignore
    }
    if (currentIndex >= visibleBanners.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  }

  return (
    <div
      data-ocid="storefront.promo_banner.panel"
      className="bg-amber-500 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {banner.badgeText && (
            <span className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0">
              {banner.badgeText}
            </span>
          )}
          <div className="min-w-0">
            <span className="font-bold text-sm">{banner.title}</span>
            {banner.description && (
              <span className="text-white/90 text-sm ml-2">
                {banner.description}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {visibleBanners.length > 1 && (
            <span className="text-xs text-white/70">
              {currentIndex + 1}/{visibleBanners.length}
            </span>
          )}
          <button
            type="button"
            data-ocid="storefront.promo_banner.close_button"
            onClick={dismiss}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Floating Button ───────────────────────────────────────────────

function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  if (!whatsappNumber) return null;
  const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hi%20Dr.%20Greens!%20I%20want%20to%20order%20microgreens.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="storefront.whatsapp.button"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: "#25D366" }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
    </a>
  );
}

// ─── Store Closed Banner ───────────────────────────────────────────────────

function StoreClosedBanner() {
  return (
    <div
      data-ocid="storefront.store_closed.panel"
      className="bg-red-600 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-3">
        <Store className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm font-semibold text-center">
          Store is currently closed. We'll be back soon!
        </p>
      </div>
    </div>
  );
}

export function Storefront({
  products,
  isLoading,
  isLoggedIn,
  onLogin,
  onLogout,
  customerName,
  customerEmail = "",
  activeTab,
  onTabChange,
  onOrderAgain,
  onOpenCart,
}: StorefrontProps) {
  const { data: activeBanners = [] } = useGetActiveBanners();
  const { data: storeSettings } = useGetStoreSettings();
  const { totalItems } = useCart();

  const isStoreOpen = storeSettings?.isStoreOpen !== false;
  const whatsappNumber = storeSettings?.whatsappNumber ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Promo Banners ───────────────────────────────────────── */}
      {activeBanners.length > 0 && <PromoBannerStrip banners={activeBanners} />}

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo — clicking it returns to shop */}
          <button
            type="button"
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onTabChange("shop")}
          >
            <img
              src="/assets/generated/verdant-greens-logo-transparent.dim_300x300.png"
              alt="Verdant Greens"
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-xl font-bold text-primary tracking-tight">
              Verdant Greens
            </span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              data-ocid="nav.shop_link"
              onClick={() => {
                onTabChange("shop");
                setTimeout(() => {
                  document
                    .getElementById("shop")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className={`text-sm font-semibold transition-colors hidden sm:block ${
                activeTab === "shop"
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Shop
            </button>
            <button
              type="button"
              data-ocid="nav.about_link"
              onClick={() => {
                onTabChange("shop");
                setTimeout(() => {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden sm:block"
            >
              About
            </button>
            <button
              type="button"
              data-ocid="nav.contact_link"
              onClick={() => {
                onTabChange("shop");
                setTimeout(() => {
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden sm:block"
            >
              Contact
            </button>

            {/* My Orders tab — only shown when logged in */}
            {isLoggedIn && (
              <button
                type="button"
                data-ocid="nav.my_orders_tab"
                onClick={() => onTabChange("my-orders")}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hidden sm:flex ${
                  activeTab === "my-orders"
                    ? "text-primary font-bold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                My Orders
              </button>
            )}

            {/* Cart button */}
            <button
              type="button"
              data-ocid="nav.cart_button"
              onClick={onOpenCart}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-primary/10 transition-colors text-foreground hover:text-primary"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center leading-none min-w-[18px] min-h-[18px] px-0.5">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {customerName && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Hi, {customerName.split(" ")[0]}
                  </span>
                )}
                {!customerName && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Signed In
                  </span>
                )}
                <button
                  type="button"
                  data-ocid="nav.logout_button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-secondary hover:bg-secondary/70 px-3 py-1.5 rounded-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Button
                data-ocid="nav.login_button"
                size="sm"
                onClick={onLogin}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-8 text-xs font-semibold gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* ── Store Closed Banner ──────────────────────────────────── */}
      {!isStoreOpen && <StoreClosedBanner />}

      <main className="flex-1">
        {/* ── My Orders view ────────────────────────────────────── */}
        {activeTab === "my-orders" && (
          <MyOrders
            customerEmail={customerEmail}
            onShopClick={() => onTabChange("shop")}
            onOrderAgain={onOrderAgain}
            products={products}
          />
        )}

        {/* ── Shop content ──────────────────────────────────────── */}
        {activeTab === "shop" && (
          <>
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/assets/generated/hero-microgreens-bg.dim_1400x700.jpg')",
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/70 to-primary/30" />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-2xl"
                >
                  <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
                    <Leaf className="w-3.5 h-3.5 text-primary-foreground/80" />
                    <span className="text-primary-foreground/90 text-xs font-semibold uppercase tracking-widest">
                      Fresh · Organic · Delivered
                    </span>
                  </div>

                  <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.05] mb-6">
                    Grow Fresh,
                    <br />
                    <em className="italic font-light">Live Well.</em>
                  </h1>

                  <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                    Premium microgreens grown with care right here in India.
                    Packed with nutrients, bursting with flavour — delivered
                    fresh to your door.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      data-ocid="storefront.hero_button"
                      size="lg"
                      asChild
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2 rounded-xl px-8 h-12 text-base shadow-lg hover:scale-105 transition-all"
                    >
                      <a href="#shop">
                        Shop Now
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 font-semibold rounded-xl px-8 h-12 text-base backdrop-blur-sm"
                    >
                      <a href="#about">Learn More</a>
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Decorative wave */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg
                  viewBox="0 0 1440 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 60V20C240 60 480 0 720 20C960 40 1200 0 1440 20V60H0Z"
                    fill="oklch(0.97 0.015 95)"
                  />
                </svg>
              </div>
            </section>

            {/* ── Features strip ─────────────────────────────────────── */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {FEATURES.map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex flex-col items-center text-center gap-2 p-4"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                      <feat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-base">
                      {feat.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {feat.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── Product Grid ────────────────────────────────────────── */}
            <section
              id="shop"
              className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            >
              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
              >
                <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
                  <span className="h-px w-8 bg-primary/40 inline-block" />
                  Our Microgreens
                  <span className="h-px w-8 bg-primary/40 inline-block" />
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Fresh From the Garden
                </h2>
                <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
                  Each tray is grown to order, ensuring peak nutrition and
                  flavour when it reaches your kitchen.
                </p>
                {!isLoggedIn && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <button
                      type="button"
                      onClick={onLogin}
                      className="text-primary hover:underline font-semibold"
                    >
                      Sign in
                    </button>{" "}
                    to place an order
                  </p>
                )}
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                        key={i}
                        data-ocid="product.loading_state"
                        className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
                      >
                        <Skeleton className="aspect-[3/2] w-full" />
                        <div className="p-5 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </div>
                    ))
                  : products.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={i + 1}
                        customerEmail={customerEmail}
                        customerName={customerName}
                      />
                    ))}
              </div>
            </section>

            {/* ── About section ────────────────────────────────────────── */}
            <section
              id="about"
              className="bg-primary text-primary-foreground py-20 px-4 sm:px-6 lg:px-8"
            >
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-4">
                    <Leaf className="w-3.5 h-3.5" />
                    Our Story
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 leading-tight">
                    Grown with Care,
                    <br />
                    <em className="italic font-light">Delivered with Love</em>
                  </h2>
                  <p className="text-primary-foreground/80 leading-relaxed mb-4">
                    Verdant Greens started with a simple belief: the freshest,
                    most nutrient-dense food should be accessible to everyone.
                    We grow our microgreens in small, carefully tended batches,
                    never using pesticides or artificial additives.
                  </p>
                  <p className="text-primary-foreground/80 leading-relaxed">
                    From seed to tray in just 7–14 days, our microgreens are
                    bursting with vitamins, minerals, and enzymes that support a
                    healthy, vibrant lifestyle.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { value: "7–14", label: "Days from seed to harvest" },
                    { value: "40×", label: "More nutrients than mature veg" },
                    { value: "100%", label: "Organically grown" },
                    { value: "6+", label: "Varieties available" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-5"
                    >
                      <div className="font-display text-3xl font-bold text-primary-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-primary-foreground/70 text-sm leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* ── Contact Us ──────────────────────────────────────────── */}
            <ContactSection />
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-foreground text-background/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/generated/verdant-greens-logo-transparent.dim_300x300.png"
              alt="Verdant Greens"
              className="h-8 w-8 object-contain opacity-80"
            />
            <span className="font-display text-lg font-semibold text-background">
              Verdant Greens
            </span>
          </div>
          <p className="text-sm text-background/60 text-center">
            Fresh microgreens, delivered to your door. ·{" "}
            <a
              href="#shop"
              className="underline hover:text-background/90 transition-colors"
            >
              Order Today
            </a>
          </p>
          <p className="text-xs text-background/40 text-center">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart className="w-3 h-3 inline-block text-red-400" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-background/70 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* ── WhatsApp Floating Button ─────────────────────────────── */}
      <WhatsAppButton whatsappNumber={whatsappNumber} />
    </div>
  );
}
