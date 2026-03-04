import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMyOrders } from "@/hooks/useQueries";
import type { BackendOrder } from "@/hooks/useQueries";
import type { Product } from "@/types";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock,
  Package,
  RefreshCw,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function nanosToDate(ns: bigint): Date {
  // Motoko Time is nanoseconds since Unix epoch
  return new Date(Number(ns / BigInt(1_000_000)));
}

function formatDate(ns: bigint): string {
  const d = nanosToDate(ns);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type StatusVariant = {
  label: string;
  className: string;
  dot: string;
};

function getStatusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (s === "delivered") {
    return {
      label: "Delivered",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    };
  }
  if (s === "cancelled") {
    return {
      label: "Cancelled",
      className: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-400",
    };
  }
  if (s === "out-for-delivery") {
    return {
      label: "Out for Delivery",
      className: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    };
  }
  if (s === "confirmed" || s === "processing" || s === "preparing") {
    return {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  }
  // pending / default
  return {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  };
}

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({
  order,
  index,
  onOrderAgain,
}: {
  order: BackendOrder;
  index: number;
  onOrderAgain?: (productId: number, productName: string) => void;
}) {
  const variant = getStatusVariant(order.status);
  const orderNum = Number(order.id);

  return (
    <motion.article
      data-ocid={`my_orders.item.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground font-display">
            Order #{orderNum}
          </span>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variant.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${variant.dot}`} />
          {variant.label}
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-foreground text-base leading-tight">
              {order.productName}
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Qty:{" "}
              <span className="font-medium text-foreground">
                {Number(order.quantity)}
              </span>
              {order.discount > 0 && (
                <Badge className="ml-2 text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                  {order.discount}% off
                </Badge>
              )}
              {order.notes && (
                <>
                  {" "}
                  · <span className="italic">{order.notes}</span>
                </>
              )}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display font-bold text-foreground text-lg leading-tight">
              {formatCurrency(order.totalPrice)}
            </p>
            <p className="text-xs text-muted-foreground">total</p>
          </div>
        </div>

        {/* Delivery info */}
        {order.deliveryDate && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>{order.deliveryDate}</span>
            </div>
            {order.deliverySlot && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{order.deliverySlot}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          {onOrderAgain && (
            <Button
              data-ocid={`my_orders.order_again.button.${index}`}
              size="sm"
              variant="outline"
              onClick={() =>
                onOrderAgain(Number(order.productId), order.productName)
              }
              className="h-7 px-3 text-xs rounded-lg gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            >
              <RefreshCw className="w-3 h-3" />
              Order Again
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div
      data-ocid="my_orders.loading_state"
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/30">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-3 w-28 mt-2" />
      </div>
    </div>
  );
}

// ─── My Orders Page ──────────────────────────────────────────────────────────

interface MyOrdersProps {
  customerEmail: string;
  onShopClick: () => void;
  onOrderAgain?: (productId: number, productName: string) => void;
  products?: Product[];
}

export function MyOrders({
  customerEmail,
  onShopClick,
  onOrderAgain,
}: MyOrdersProps) {
  const { data: orders = [], isLoading } = useGetMyOrders(customerEmail);

  return (
    <section
      data-ocid="my_orders.page"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-[60vh]"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
          <span className="h-px w-8 bg-primary/40 inline-block" />
          Order History
          <span className="h-px w-8 bg-primary/40 inline-block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            My Orders
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-2 ml-0.5">
          Track all your Verdant Greens orders in one place.
        </p>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Orders list */}
      {!isLoading && orders.length > 0 && (
        <div data-ocid="my_orders.list" className="space-y-4">
          <AnimatePresence>
            {orders
              .slice()
              .sort((a, b) => Number(b.createdAt - a.createdAt))
              .map((order, i) => (
                <OrderCard
                  key={order.id.toString()}
                  order={order}
                  index={i + 1}
                  onOrderAgain={onOrderAgain}
                />
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && orders.length === 0 && (
        <motion.div
          data-ocid="my_orders.empty_state"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center gap-5 py-20 px-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <ShoppingBasket className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              You haven't placed any orders yet. Browse our fresh microgreens
              and place your first order!
            </p>
          </div>
          <Button
            data-ocid="my_orders.primary_button"
            onClick={onShopClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-10 font-semibold gap-2"
          >
            Browse Microgreens
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </section>
  );
}
