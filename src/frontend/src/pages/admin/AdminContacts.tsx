import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetContactSubmissions } from "@/hooks/useQueries";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useState } from "react";

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

export function AdminContacts() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { data: submissions = [], isLoading } = useGetContactSubmissions();

  const sorted = [...submissions].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Contact Messages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enquiries and messages from customers
        </p>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {submissions.length} message{submissions.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      {isLoading ? (
        <div
          data-ocid="contacts.loading_state"
          className="space-y-2 rounded-xl border border-border overflow-hidden"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="contacts.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card"
        >
          <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No messages yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact form submissions will appear here
          </p>
        </div>
      ) : (
        <div
          data-ocid="contacts.table"
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
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Message
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((sub, i) => {
                  const key = String(sub.id);
                  const isExpanded = expandedIds.has(key);
                  const isLong = sub.message.length > 100;

                  return (
                    <TableRow
                      key={key}
                      data-ocid={`contacts.row.item.${i + 1}`}
                      className="hover:bg-muted/20 transition-colors align-top"
                    >
                      <TableCell className="font-semibold text-sm text-foreground py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary uppercase">
                              {sub.name.charAt(0)}
                            </span>
                          </div>
                          <span className="truncate max-w-[100px]">
                            {sub.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell py-3">
                        <a
                          href={`mailto:${sub.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {sub.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell py-3">
                        {sub.phone || "—"}
                      </TableCell>
                      <TableCell className="py-3 max-w-[280px]">
                        <div className="text-sm text-foreground">
                          <p
                            className={`text-xs leading-relaxed ${!isExpanded && isLong ? "line-clamp-2" : ""}`}
                          >
                            {sub.message}
                          </p>
                          {isLong && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(key)}
                              className="h-6 px-0 text-xs text-primary hover:text-primary/80 hover:bg-transparent mt-1 gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  Show more
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell py-3 whitespace-nowrap">
                        {formatDate(sub.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
