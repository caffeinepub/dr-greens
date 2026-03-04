import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddProduct,
  useExportOrdersCSV,
  useGetAllOrders,
  useGetContactSubmissions,
  useGetOrderStats,
  useGetProducts,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "@/hooks/useQueries";
import type { ContactSubmission, OrderStatus, Product } from "@/types";
import { mapContactSubmission, mapOrder, mapProduct } from "@/utils/mappers";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Leaf,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  MoreVertical,
  Plus,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AdminPanelProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  onNavigateStorefront: () => void;
}

type FilterTab = "all" | OrderStatus;

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  unit: string;
  stock: string;
  active: boolean;
}

const defaultProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  unit: "per tray",
  stock: "",
  active: true,
};

// ─── Main component ─────────────────────────────────────────────────────────
export function AdminPanel({
  isLoggedIn,
  isAdmin,
  isInitializing,
  onNavigateStorefront,
}: AdminPanelProps) {
  const { login, clear, isLoggingIn } = useInternetIdentity();

  // If not logged in or not admin, show auth wall
  if (isInitializing) {
    return <AdminLoadingState onNavigateStorefront={onNavigateStorefront} />;
  }

  if (!isLoggedIn) {
    return (
      <AdminAuthWall
        onNavigateStorefront={onNavigateStorefront}
        onLogin={login}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  if (!isAdmin) {
    return (
      <AdminAccessDenied
        onNavigateStorefront={onNavigateStorefront}
        onLogout={clear}
      />
    );
  }

  return (
    <AdminDashboard
      onNavigateStorefront={onNavigateStorefront}
      onLogout={clear}
    />
  );
}

// ─── Auth wall ──────────────────────────────────────────────────────────────
function AdminLoadingState({
  onNavigateStorefront,
}: { onNavigateStorefront: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader onNavigateStorefront={onNavigateStorefront} />
      <div className="flex-1 flex items-center justify-center">
        <div data-ocid="admin.loading_state" className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Leaf className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    </div>
  );
}

function AdminAuthWall({
  onNavigateStorefront,
  onLogin,
  isLoggingIn,
}: {
  onNavigateStorefront: () => void;
  onLogin: () => void;
  isLoggingIn: boolean;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader onNavigateStorefront={onNavigateStorefront} />
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-6 bg-card rounded-2xl border border-border p-8 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Admin Login
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in with your Internet Identity to access the Dr. Greens admin
              dashboard.
            </p>
          </div>
          <Button
            data-ocid="admin.login_button"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 h-11"
          >
            {isLoggingIn ? (
              <>
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
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function AdminAccessDenied({
  onNavigateStorefront,
  onLogout,
}: {
  onNavigateStorefront: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader onNavigateStorefront={onNavigateStorefront} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-5 bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Leaf className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm">
              Your account does not have admin privileges.
            </p>
          </div>
          <Button
            data-ocid="admin.logout_button"
            variant="outline"
            onClick={onLogout}
            className="w-full rounded-xl gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────
function AdminHeader({
  onNavigateStorefront,
  onLogout,
}: {
  onNavigateStorefront: () => void;
  onLogout?: () => void;
}) {
  return (
    <header className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="admin.back_button"
            onClick={() => {
              window.location.hash = "#/";
              onNavigateStorefront();
            }}
            className="hover:bg-primary-foreground/10 p-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary-foreground/80" />
            <span className="font-display text-lg font-bold">
              Dr. Greens Admin
            </span>
          </div>
        </div>
        {onLogout ? (
          <button
            type="button"
            data-ocid="admin.logout_button"
            onClick={onLogout}
            className="text-xs text-primary-foreground/70 hover:text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        ) : (
          <span className="text-xs text-primary-foreground/60 bg-primary-foreground/10 px-3 py-1 rounded-full">
            Dashboard
          </span>
        )}
      </div>
    </header>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function AdminDashboard({
  onNavigateStorefront,
  onLogout,
}: {
  onNavigateStorefront: () => void;
  onLogout: () => void;
}) {
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] =
    useState<ProductFormState>(defaultProductForm);

  // Queries
  const { data: backendOrders = [], isLoading: ordersLoading } =
    useGetAllOrders();
  const { data: backendProducts = [], isLoading: productsLoading } =
    useGetProducts();
  const { data: stats } = useGetOrderStats();
  const { data: backendContacts = [], isLoading: contactsLoading } =
    useGetContactSubmissions();

  // Mutations
  const updateStatusMutation = useUpdateOrderStatus();
  const updateProductMutation = useUpdateProduct();
  const addProductMutation = useAddProduct();
  const exportCSVMutation = useExportOrdersCSV();

  // Map backend data to frontend types
  const orders = backendOrders.map(mapOrder);
  const products = backendProducts.map(mapProduct);
  const contacts: ContactSubmission[] =
    backendContacts.map(mapContactSubmission);

  // Filter orders
  const filteredOrders =
    filterTab === "all" ? orders : orders.filter((o) => o.status === filterTab);

  // Stats from backend (or computed from orders as fallback)
  const totalOrders = stats ? Number(stats.totalOrders) : orders.length;
  const totalRevenue = stats
    ? stats.totalRevenue
    : orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = stats
    ? Number(stats.pendingCount)
    : orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = stats
    ? Number(stats.deliveredCount)
    : orders.filter((o) => o.status === "delivered").length;

  const STATS = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Revenue",
      value: `R${totalRevenue.toFixed(0)}`,
      icon: TrendingUp,
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle,
      color: "bg-green-50 text-green-700",
    },
  ];

  async function handleUpdateOrderStatus(orderId: string, status: OrderStatus) {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: BigInt(orderId),
        status,
      });
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update order status");
    }
  }

  function handleEditClick(product: Product) {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      unit: product.unit,
      stock: String(product.stock),
      active: product.active !== false,
    });
  }

  async function handleSaveProduct() {
    if (!editProduct) return;
    try {
      await updateProductMutation.mutateAsync({
        id: BigInt(editProduct.id),
        name: productForm.name,
        description: productForm.description,
        price: Number.parseFloat(productForm.price) || 0,
        unit: productForm.unit,
        stock: BigInt(Number.parseInt(productForm.stock, 10) || 0),
        isActive: productForm.active,
      });
      toast.success("Product updated");
      setEditProduct(null);
    } catch {
      toast.error("Failed to update product");
    }
  }

  async function handleAddProduct() {
    try {
      await addProductMutation.mutateAsync({
        name: productForm.name,
        description: productForm.description,
        price: Number.parseFloat(productForm.price) || 0,
        unit: productForm.unit,
        stock: BigInt(Number.parseInt(productForm.stock, 10) || 0),
      });
      toast.success("Product added");
      setShowAddProduct(false);
      setProductForm(defaultProductForm);
    } catch {
      toast.error("Failed to add product");
    }
  }

  function openAddDialog() {
    setProductForm(defaultProductForm);
    setShowAddProduct(true);
  }

  function handleExportCSV() {
    exportCSVMutation.mutate(undefined, {
      onError: () => toast.error("Failed to export CSV"),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        onNavigateStorefront={onNavigateStorefront}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Orders section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Orders
            </h2>
            <Button
              data-ocid="admin.export_button"
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              disabled={exportCSVMutation.isPending}
              className="gap-1.5 rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              {exportCSVMutation.isPending ? "Exporting…" : "Export CSV"}
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="px-6 pt-4 pb-0">
            <Tabs
              value={filterTab}
              onValueChange={(v) => setFilterTab(v as FilterTab)}
            >
              <TabsList className="bg-secondary">
                {(
                  [
                    "all",
                    "pending",
                    "processing",
                    "delivered",
                    "cancelled",
                  ] as const
                ).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    data-ocid="admin.filter.tab"
                    className="capitalize text-xs"
                  >
                    {tab === "all" ? "All" : STATUS_LABELS[tab]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table data-ocid="admin.orders_table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Order #</TableHead>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs text-center">Qty</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                      key={i}
                      data-ocid="admin.orders_table.loading_state"
                    >
                      {Array.from({ length: 10 }).map((__, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      data-ocid="admin.orders_table.empty_state"
                      className="text-center py-12 text-muted-foreground"
                    >
                      No orders
                      {filterTab !== "all" ? ` with status "${filterTab}"` : ""}{" "}
                      yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, i) => (
                    <TableRow
                      key={order.id}
                      data-ocid={`admin.orders_table.row.${i + 1}`}
                      className="hover:bg-secondary/40"
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[120px] truncate">
                        {order.productName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.phone}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                        {order.email}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        R{order.total}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {order.date}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              data-ocid={`admin.order_status.dropdown_menu.${i + 1}`}
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-sm">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "processing")
                              }
                            >
                              Mark Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "delivered")
                              }
                            >
                              Mark Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "cancelled")
                              }
                              className="text-destructive"
                            >
                              Mark Cancelled
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Products section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Products
            </h2>
            <Button
              data-ocid="admin.add_product_button"
              size="sm"
              onClick={openAddDialog}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table data-ocid="admin.products_table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                  <TableHead className="text-xs text-center">Stock</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-center">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                      key={i}
                      data-ocid="admin.products_table.loading_state"
                    >
                      {Array.from({ length: 5 }).map((__, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      data-ocid="admin.products_table.empty_state"
                      className="text-center py-12 text-muted-foreground"
                    >
                      No products yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, i) => (
                    <TableRow
                      key={product.id}
                      data-ocid={`admin.products_table.row.${i + 1}`}
                      className="hover:bg-secondary/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-secondary"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        R{product.price}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <span
                          className={`font-semibold ${
                            product.stock === 0
                              ? "text-destructive"
                              : product.stock <= 5
                                ? "text-amber-600"
                                : "text-green-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.active !== false ? "default" : "secondary"
                          }
                          className={
                            product.active !== false
                              ? "bg-primary/15 text-primary border-0 text-xs"
                              : "text-xs"
                          }
                        >
                          {product.active !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          data-ocid={`admin.products_table.edit_button.${i + 1}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                          className="rounded-lg text-xs h-7 px-3"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Contact Messages section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Contact Messages
            </h2>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {contacts.length} message{contacts.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table data-ocid="admin.contacts_table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs w-8">#</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Message</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                      key={i}
                      data-ocid="admin.contacts_table.loading_state"
                    >
                      {Array.from({ length: 6 }).map((__, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : contacts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      data-ocid="admin.contacts_table.empty_state"
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Mail className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No contact messages yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact, i) => (
                    <TableRow
                      key={contact.id}
                      data-ocid={`admin.contacts_table.row.${i + 1}`}
                      className="hover:bg-secondary/40 align-top"
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">
                        {contact.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {contact.phone || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-[300px]">
                        <p className="line-clamp-2 leading-relaxed">
                          {contact.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {contact.date}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
      >
        <DialogContent
          data-ocid="admin.edit_product.dialog"
          className="sm:max-w-[440px] rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ProductFormFields form={productForm} setForm={setProductForm} />
          </div>
          <DialogFooter>
            <Button
              data-ocid="admin.edit_product.cancel_button"
              variant="outline"
              onClick={() => setEditProduct(null)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.edit_product.save_button"
              onClick={handleSaveProduct}
              disabled={updateProductMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              {updateProductMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent
          data-ocid="admin.add_product.dialog"
          className="sm:max-w-[440px] rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Add New Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ProductFormFields form={productForm} setForm={setProductForm} />
          </div>
          <DialogFooter>
            <Button
              data-ocid="admin.add_product.cancel_button"
              variant="outline"
              onClick={() => setShowAddProduct(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.add_product.submit_button"
              onClick={handleAddProduct}
              disabled={addProductMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              {addProductMutation.isPending ? "Adding…" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Product form fields ─────────────────────────────────────────────────────
interface ProductFormFieldsProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
}

function ProductFormFields({ form, setForm }: ProductFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Product Name</Label>
        <Input
          data-ocid="admin.product_form.name_input"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="rounded-xl"
          placeholder="e.g. Sunflower Shoots"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Description</Label>
        <Input
          data-ocid="admin.product_form.description_input"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          className="rounded-xl"
          placeholder="Short description"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Price (R)</Label>
          <Input
            data-ocid="admin.product_form.price_input"
            type="number"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            className="rounded-xl"
            placeholder="85"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Stock (units)</Label>
          <Input
            data-ocid="admin.product_form.stock_input"
            type="number"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
            className="rounded-xl"
            placeholder="20"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Unit label</Label>
        <Input
          data-ocid="admin.product_form.unit_input"
          value={form.unit}
          onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
          className="rounded-xl"
          placeholder="per tray"
        />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Switch
          data-ocid="admin.product_form.active_switch"
          checked={form.active}
          onCheckedChange={(checked) =>
            setForm((p) => ({ ...p, active: checked }))
          }
          id="product-active"
        />
        <Label htmlFor="product-active" className="text-sm">
          Active (visible in store)
        </Label>
      </div>
    </>
  );
}
