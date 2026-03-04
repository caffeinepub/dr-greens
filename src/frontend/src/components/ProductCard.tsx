import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import {
  type BackendReview,
  useGetProductReviews,
  useSubmitReview,
} from "@/hooks/useQueries";
import type { Product } from "@/types";
import { FALLBACK_IMAGE } from "@/utils/mappers";
import {
  CheckCircle2,
  Leaf,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder?: (product: Product) => void;
  customerEmail?: string;
  customerName?: string;
}

function getStockBadge(stock: number) {
  if (stock === 0)
    return { label: "Out of Stock", variant: "destructive" as const };
  if (stock <= 5) return { label: "Low Stock", variant: "secondary" as const };
  return { label: "In Stock", variant: "default" as const };
}

function StarRating({
  rating,
  interactive = false,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              s <= (interactive ? hovered || rating : rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: BackendReview }) {
  const firstName = review.customerName.split(" ")[0];
  const date = new Date(
    Number(review.createdAt / BigInt(1_000_000)),
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border-b border-border last:border-0 py-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {firstName[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {firstName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <StarRating rating={Number(review.rating)} />
      {review.comment && (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

function ReviewsSheet({
  product,
  open,
  onClose,
  customerEmail,
  customerName,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  customerEmail?: string;
  customerName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const productIdBig = BigInt(product.id);
  const { data: reviews = [], isLoading } = useGetProductReviews(
    open ? productIdBig : null,
  );
  const submitReview = useSubmitReview();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0;

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!customerEmail || !customerName) return;
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    try {
      await submitReview.mutateAsync({
        productId: productIdBig,
        productName: product.name,
        customerEmail,
        customerName,
        rating: BigInt(rating),
        comment: comment.trim(),
      });
      toast.success("Review submitted! Thank you.");
      setShowForm(false);
      setRating(0);
      setComment("");
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        data-ocid="reviews.sheet"
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-xl">
            Reviews — {product.name}
          </SheetTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm font-semibold text-foreground">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </SheetHeader>

        {/* Write a review */}
        {customerEmail && (
          <div className="mb-4">
            {showForm ? (
              <form
                onSubmit={handleSubmitReview}
                className="bg-secondary rounded-xl p-4 space-y-3"
              >
                <Label className="text-sm font-semibold">Your Rating</Label>
                <StarRating rating={rating} interactive onRate={setRating} />
                <div className="space-y-1.5">
                  <Label
                    htmlFor="review-comment"
                    className="text-sm font-semibold"
                  >
                    Comment{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="review-comment"
                    data-ocid="reviews.comment.textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience…"
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    data-ocid="reviews.submit_button"
                    type="submit"
                    disabled={submitReview.isPending}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex-1"
                  >
                    {submitReview.isPending ? "Submitting…" : "Submit Review"}
                  </Button>
                  <Button
                    data-ocid="reviews.cancel_button"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                data-ocid="reviews.write.open_modal_button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
                className="w-full rounded-xl gap-2"
              >
                <Star className="w-3.5 h-3.5" />
                Write a Review
              </Button>
            )}
          </div>
        )}

        {/* Reviews list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 border-b border-border space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div
            data-ocid="reviews.empty_state"
            className="text-center py-12 text-muted-foreground"
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div>
            {reviews.map((r) => (
              <ReviewItem key={r.id.toString()} review={r} />
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function ProductCard({
  product,
  index,
  customerEmail,
  customerName,
}: ProductCardProps) {
  const stockBadge = getStockBadge(product.stock);
  const isOutOfStock = product.stock === 0;
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const cartQty = cartItem?.quantity ?? 0;
  const inCart = cartQty > 0;

  // Fetch reviews for rating badge (only a small fetch)
  const { data: reviews = [] } = useGetProductReviews(BigInt(product.id));
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  }

  return (
    <>
      <motion.div
        data-ocid={`product.item.${index}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.5,
          delay: index * 0.07,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
      >
        {/* Product image */}
        <div className="relative overflow-hidden aspect-[3/2] bg-secondary">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = FALLBACK_IMAGE;
            }}
          />
          {/* Stock badge overlay */}
          <div className="absolute top-3 right-3">
            <Badge
              variant={stockBadge.variant}
              className={
                stockBadge.label === "In Stock"
                  ? "bg-primary/90 text-primary-foreground border-0 text-xs font-semibold backdrop-blur-sm"
                  : stockBadge.label === "Low Stock"
                    ? "bg-accent/90 text-accent-foreground border-0 text-xs font-semibold backdrop-blur-sm"
                    : "bg-destructive/90 text-destructive-foreground border-0 text-xs font-semibold backdrop-blur-sm"
              }
            >
              {stockBadge.label}
            </Badge>
          </div>

          {/* Leaf icon decoration */}
          <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {/* Card content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Star rating badge */}
          {reviews.length > 0 && (
            <button
              type="button"
              data-ocid={`product.reviews.open_modal_button.${index}`}
              onClick={() => setReviewsOpen(true)}
              className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:text-amber-500 transition-colors w-fit"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)}
              <span className="text-muted-foreground font-normal">
                ({reviews.length})
              </span>
            </button>
          )}

          {/* Price + CTA */}
          <div className="mt-auto pt-3 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-display font-bold text-primary">
                  ₹{product.price}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {product.unit}
                </span>
              </div>
              <Button
                data-ocid={`product.reviews.secondary_button.${index}`}
                size="sm"
                variant="ghost"
                onClick={() => setReviewsOpen(true)}
                className="text-muted-foreground hover:text-foreground h-8 px-2 rounded-xl"
                title="View reviews"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Cart controls */}
            {inCart ? (
              <div
                data-ocid={`product.cart_controls.${index}`}
                className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    In Cart ({cartQty})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-ocid={`product.cart_minus.${index}`}
                    onClick={() => {
                      if (cartQty <= 1) {
                        removeFromCart(product.id);
                      } else {
                        updateQuantity(product.id, cartQty - 1);
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold text-foreground w-5 text-center">
                    {cartQty}
                  </span>
                  <button
                    type="button"
                    data-ocid={`product.cart_plus.${index}`}
                    onClick={() => updateQuantity(product.id, cartQty + 1)}
                    disabled={cartQty >= product.stock}
                    className="w-6 h-6 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <Button
                data-ocid={`product.add_to_cart_button.${index}`}
                size="sm"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <ReviewsSheet
        product={product}
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        customerEmail={customerEmail}
        customerName={customerName}
      />
    </>
  );
}
