// Frontend product type (mapped from backend, with image added client-side)
export interface Product {
  id: number; // bigint converted to number for display
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number; // bigint converted to number for display
  image: string; // hardcoded client-side mapping
  active?: boolean; // mapped from isActive
}

export type OrderStatus = "pending" | "processing" | "delivered" | "cancelled";

// Frontend order type (mapped from backend)
export interface Order {
  id: string; // bigint.toString()
  orderNumber: string; // same as id
  productId: number; // bigint converted to number
  productName: string;
  customerName: string;
  email: string;
  phone: string;
  quantity: number; // bigint converted to number
  unitPrice: number; // derived from totalPrice / quantity
  total: number; // totalPrice from backend
  notes: string;
  status: OrderStatus;
  date: string; // formatted from createdAt
}

export interface OrderModalState {
  open: boolean;
  product: Product | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
}
