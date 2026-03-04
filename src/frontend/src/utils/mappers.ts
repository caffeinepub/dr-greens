import type {
  BackendContactSubmission,
  BackendOrder,
  BackendProduct,
} from "@/hooks/useQueries";
import type { ContactSubmission, Order, OrderStatus, Product } from "@/types";

// ─── Product image mapping ────────────────────────────────────────────────
// Maps product IDs (1-based) to local asset paths.
// New products added via admin will fall back to a generic image.
const PRODUCT_IMAGES: Record<number, string> = {
  1: "/assets/generated/sunflower-shoots.dim_600x400.jpg",
  2: "/assets/generated/pea-shoots.dim_600x400.jpg",
  3: "/assets/generated/radish-microgreens.dim_600x400.jpg",
  4: "/assets/generated/broccoli-microgreens.dim_600x400.jpg",
  5: "/assets/generated/wheatgrass.dim_600x400.jpg",
  6: "/assets/generated/mixed-microgreens.dim_600x400.jpg",
};

const FALLBACK_IMAGE = "/assets/generated/mixed-microgreens.dim_600x400.jpg";

export function mapProduct(bp: BackendProduct): Product {
  const numericId = Number(bp.id);
  return {
    id: numericId,
    name: bp.name,
    description: bp.description,
    price: bp.price,
    unit: bp.unit,
    stock: Number(bp.stock),
    image: PRODUCT_IMAGES[numericId] ?? FALLBACK_IMAGE,
    active: bp.isActive,
  };
}

export function mapOrder(bo: BackendOrder): Order {
  const quantity = Number(bo.quantity);
  const total = bo.totalPrice;
  const unitPrice = quantity > 0 ? total / quantity : total;

  // Format date from nanosecond timestamp
  const createdAtMs = Number(bo.createdAt) / 1_000_000;
  const date = new Date(createdAtMs).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const status = (bo.status || "pending") as OrderStatus;

  return {
    id: bo.id.toString(),
    orderNumber: bo.id.toString(),
    productId: Number(bo.productId),
    productName: bo.productName,
    customerName: bo.customerName,
    email: bo.email,
    phone: bo.phone,
    quantity,
    unitPrice,
    total,
    notes: bo.notes,
    status,
    date,
  };
}

export function mapContactSubmission(
  bc: BackendContactSubmission,
): ContactSubmission {
  const createdAtMs = Number(bc.createdAt) / 1_000_000;
  const date = new Date(createdAtMs).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    id: bc.id.toString(),
    name: bc.name,
    email: bc.email,
    phone: bc.phone,
    message: bc.message,
    date,
  };
}
