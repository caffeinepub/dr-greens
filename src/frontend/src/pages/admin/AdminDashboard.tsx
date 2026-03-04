import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllOrdersAdmin,
  useGetOrderStatsAdmin,
  useGetProductsAdmin,
  useGetStoreSettingsAdmin,
} from "@/hooks/useAdminQueries";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock,
  Package,
  TrendingUp,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(ns: bigint) {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "out-for-delivery": {
    label: "Out for Delivery",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOrderStatsAdmin();
  const { data: orders = [], isLoading: ordersLoading } =
    useGetAllOrdersAdmin();
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsAdmin();
  const { data: storeSettings } = useGetStoreSettingsAdmin();

  const lowStockThreshold = storeSettings
    ? Number(storeSettings.lowStockThreshold)
    : 5;

  const lowStockProducts = products.filter(
    (p) => p.isActive && Number(p.stock) <= lowStockThreshold,
  );

  const recentOrders = [...orders]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 5);

  const statCards = [
    {
      label: "Total Orders",
      value: stats ? Number(stats.totalOrders) : 0,
      icon: ClipboardList,
      colorClass: "bg-blue-50 text-blue-600",
      cardClass: "border-l-4 border-l-blue-400",
      formatter: (v: number) => v.toString(),
    },
    {
      label: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      icon: Banknote,
      colorClass: "bg-emerald-50 text-emerald-600",
      cardClass: "border-l-4 border-l-emerald-400",
      formatter: formatCurrency,
    },
    {
      label: "Pending Orders",
      value: stats ? Number(stats.pendingCount) : 0,
      icon: Clock,
      colorClass: "bg-amber-50 text-amber-600",
      cardClass: "border-l-4 border-l-amber-400",
      formatter: (v: number) => v.toString(),
    },
    {
      label: "Processing",
      value: stats ? Number(stats.processingCount) : 0,
      icon: Package,
      colorClass: "bg-sky-50 text-sky-600",
      cardClass: "border-l-4 border-l-sky-400",
      formatter: (v: number) => v.toString(),
    },
    {
      label: "Out for Delivery",
      value: stats ? Number(stats.outForDeliveryCount ?? 0) : 0,
      icon: Truck,
      colorClass: "bg-purple-50 text-purple-600",
      cardClass: "border-l-4 border-l-purple-400",
      formatter: (v: number) => v.toString(),
    },
    {
      label: "Delivered",
      value: stats ? Number(stats.deliveredCount) : 0,
      icon: BadgeCheck,
      colorClass: "bg-green-50 text-green-600",
      cardClass: "border-l-4 border-l-green-500",
      formatter: (v: number) => v.toString(),
    },
    {
      label: "Cancelled",
      value: stats ? Number(stats.cancelledCount) : 0,
      icon: XCircle,
      colorClass: "bg-rose-50 text-rose-600",
      cardClass: "border-l-4 border-l-rose-400",
      formatter: (v: number) => v.toString(),
    },
  ];

  // Completion rate
  const completionRate =
    stats && Number(stats.totalOrders) > 0
      ? Math.round(
          (Number(stats.deliveredCount) / Number(stats.totalOrders)) * 100,
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your Verdant Greens business at a glance
        </p>
      </div>

      {/* Stat Cards */}
      <div
        data-ocid="dashboard.stats.panel"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <Card className={`overflow-hidden ${card.cardClass} shadow-xs`}>
              <CardContent className="p-4 sm:p-5">
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {card.label}
                      </p>
                      <p className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-none">
                        {card.formatter(card.value)}
                      </p>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl ${card.colorClass} flex-shrink-0`}
                    >
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Business Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completion Rate */}
        <Card className="shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Delivery Rate
                </p>
              </div>
              {statsLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <span className="font-display text-xl font-bold text-primary">
                  {completionRate}%
                </span>
              )}
            </div>
            {statsLoading ? (
              <Skeleton className="h-2 w-full rounded-full" />
            ) : (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Percentage of orders successfully delivered
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">
                Stock Alerts
              </p>
              {lowStockProducts.length > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs ml-auto">
                  {lowStockProducts.length} low
                </Badge>
              )}
            </div>
            {productsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">
                  All products have healthy stock
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id.toString()}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground font-medium truncate max-w-[160px]">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-muted-foreground">
                        {String(product.stock)} left
                      </span>
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                        Low Stock
                      </Badge>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{lowStockProducts.length - 3} more items low on stock
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            Recent Orders
          </h2>
          <Badge variant="secondary" className="text-xs">
            Last 5
          </Badge>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div
            data-ocid="dashboard.orders.empty_state"
            className="text-center py-12 text-muted-foreground text-sm"
          >
            No orders yet. They'll appear here once customers start ordering.
          </div>
        ) : (
          <div
            data-ocid="dashboard.orders.list"
            className="space-y-2 rounded-xl border border-border overflow-hidden"
          >
            {recentOrders.map((order, i) => (
              <div
                key={String(order.id)}
                data-ocid={`dashboard.orders.item.${i + 1}`}
                className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.productName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(order.totalPrice)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
