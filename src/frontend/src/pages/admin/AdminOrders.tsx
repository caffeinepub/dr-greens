import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type BackendOrder,
  useExportOrdersCSV,
  useGetAllOrders,
  useUpdateOrderStatus,
} from "@/hooks/useQueries";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  PackageOpen,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "out-for-delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

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

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(ns: bigint) {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 20;

export function AdminOrders() {
  const [filterTab, setFilterTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const exportCSV = useExportOrdersCSV();

  // Filter by tab
  const tabFiltered =
    filterTab === "all" ? orders : orders.filter((o) => o.status === filterTab);

  // Filter by search
  const searchLower = search.toLowerCase().trim();
  const filtered = searchLower
    ? tabFiltered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(searchLower) ||
          o.email.toLowerCase().includes(searchLower) ||
          o.productName.toLowerCase().includes(searchLower) ||
          o.phone.toLowerCase().includes(searchLower),
      )
    : tabFiltered;

  // Sort newest first
  const sorted = [...filtered].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  // Pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleStatusChange(order: BackendOrder, newStatus: string) {
    const key = String(order.id);
    setUpdatingIds((prev) => new Set(prev).add(key));
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: newStatus });
      toast.success(`Order #${order.id} status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  function handleExportCSV() {
    exportCSV.mutate(undefined, {
      onSuccess: () => toast.success("CSV downloaded successfully!"),
      onError: () => toast.error("Failed to export CSV."),
    });
  }

  function handleTabChange(value: string) {
    setFilterTab(value);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and update all customer orders
          </p>
        </div>
        <Button
          data-ocid="orders.export.primary_button"
          onClick={handleExportCSV}
          disabled={exportCSV.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 h-9 text-sm font-semibold"
        >
          {exportCSV.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Filter tabs */}
      <div
        data-ocid="orders.filter.tab"
        className="flex flex-wrap gap-1.5 p-1 bg-muted rounded-xl w-fit"
      >
        {[{ value: "all", label: "All" }, ...STATUS_OPTIONS].map((tab) => {
          const count =
            tab.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === tab.value
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${filterTab === tab.value ? "text-primary" : "text-muted-foreground"}`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + count row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="orders.search_input"
            placeholder="Search by name, email, product…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 rounded-xl h-9 text-sm"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          data-ocid="orders.loading_state"
          className="space-y-2 rounded-xl border border-border overflow-hidden"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card"
        >
          <PackageOpen className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No orders found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try adjusting your search"
              : "Orders will appear here once customers start ordering"}
          </p>
        </div>
      ) : (
        <>
          <div
            data-ocid="orders.table"
            className="rounded-xl border border-border overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">
                      #ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Product
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                      Qty
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[160px]">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">
                      Delivery
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">
                      Ordered
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((order, i) => {
                    const key = String(order.id);
                    const isUpdating = updatingIds.has(key);
                    return (
                      <TableRow
                        key={key}
                        data-ocid={`orders.row.item.${i + 1}`}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          #{String(order.id)}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground">
                          {order.productName}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {order.customerName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {order.email}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {order.phone}
                        </TableCell>
                        <TableCell className="text-sm text-center font-medium">
                          {String(order.quantity)}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-right text-foreground">
                          {formatCurrency(order.totalPrice)}
                        </TableCell>
                        <TableCell>
                          {isUpdating ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Updating…
                            </div>
                          ) : (
                            <Select
                              value={order.status}
                              onValueChange={(val) =>
                                handleStatusChange(order, val)
                              }
                            >
                              <SelectTrigger
                                data-ocid={`orders.status.select.${i + 1}`}
                                className="h-7 text-xs rounded-lg w-40 border-border bg-background"
                              >
                                <SelectValue>
                                  <StatusBadge status={order.status} />
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                  <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs"
                                  >
                                    <StatusBadge status={opt.value} />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden xl:table-cell whitespace-nowrap">
                          {order.deliveryDate ? (
                            <div>
                              <div>{order.deliveryDate}</div>
                              {order.deliverySlot && (
                                <div className="text-muted-foreground/70">
                                  {order.deliverySlot}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden xl:table-cell whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} · {sorted.length} total
              </span>
              <div className="flex items-center gap-2">
                <Button
                  data-ocid="orders.pagination_prev"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-lg gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </Button>
                <Button
                  data-ocid="orders.pagination_next"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 rounded-lg gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
