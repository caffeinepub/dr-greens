import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllCustomerProfilesAdmin } from "@/hooks/useAdminQueries";
import { ExternalLink, Search, Users } from "lucide-react";
import { useState } from "react";

function formatDate(ns: bigint) {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminCustomers() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useGetAllCustomerProfilesAdmin();

  const searchLower = search.toLowerCase().trim();
  const filtered = searchLower
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.toLowerCase().includes(searchLower),
      )
    : customers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All registered customers and their contact details
          </p>
        </div>
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="customers.search_input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-9 text-sm"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          data-ocid="customers.loading_state"
          className="space-y-2 rounded-xl border border-border overflow-hidden"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="customers.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card"
        >
          <Users className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {search ? "No customers found" : "No customers yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try adjusting your search"
              : "Customers will appear here once they register"}
          </p>
        </div>
      ) : (
        <div
          data-ocid="customers.table"
          className="rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    Maps Link
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">
                    Registered
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer, i) => (
                  <TableRow
                    key={customer.email}
                    data-ocid={`customers.row.item.${i + 1}`}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary uppercase">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-foreground">
                          {customer.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      <a
                        href={`mailto:${customer.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {customer.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <a
                        href={`tel:${customer.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {customer.phone}
                      </a>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[180px]">
                      <span className="line-clamp-2">{customer.location}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {customer.googleMapsLink ? (
                        <a
                          data-ocid={`customers.maps.link.${i + 1}`}
                          href={customer.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Map
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell whitespace-nowrap">
                      {customer.createdAt
                        ? formatDate(customer.createdAt)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
