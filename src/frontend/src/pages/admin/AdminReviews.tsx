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
import { useGetAllReviews } from "@/hooks/useQueries";
import { MessageSquare, Search, Star } from "lucide-react";
import { useState } from "react";

function formatDate(ns: bigint) {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-foreground">
        {rating}
      </span>
    </div>
  );
}

export function AdminReviews() {
  const [search, setSearch] = useState("");
  const { data: reviews = [], isLoading } = useGetAllReviews();

  const filtered = search.trim()
    ? reviews.filter(
        (r) =>
          r.productName.toLowerCase().includes(search.toLowerCase()) ||
          r.customerName.toLowerCase().includes(search.toLowerCase()),
      )
    : reviews;

  const sorted = [...filtered].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All customer product reviews
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="reviews.search_input"
            placeholder="Search by product or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-9 text-sm"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered.length} review{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          data-ocid="reviews.loading_state"
          className="space-y-2 rounded-xl border border-border overflow-hidden"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="reviews.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card"
        >
          <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No reviews yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try adjusting your search"
              : "Customer reviews will appear here"}
          </p>
        </div>
      ) : (
        <div
          data-ocid="reviews.table"
          className="rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rating
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Comment
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((review, i) => (
                  <TableRow
                    key={review.id.toString()}
                    data-ocid={`reviews.row.item.${i + 1}`}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-semibold text-sm text-foreground">
                      {review.productName}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {review.customerName}
                    </TableCell>
                    <TableCell>
                      <StarDisplay rating={Number(review.rating)} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px]">
                      <span className="line-clamp-2">
                        {review.comment || (
                          <em className="opacity-50">No comment</em>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                      {formatDate(review.createdAt)}
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
