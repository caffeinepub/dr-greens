import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Type helpers ──────────────────────────────────────────────────────────

export interface BackendProduct {
  id: bigint;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: bigint;
  isActive: boolean;
}

export interface BackendOrder {
  id: bigint;
  productId: bigint;
  productName: string;
  customerName: string;
  email: string;
  phone: string;
  quantity: bigint;
  totalPrice: number;
  status: string;
  notes: string;
  createdAt: bigint;
}

export interface BackendStats {
  totalOrders: bigint;
  totalRevenue: number;
  pendingCount: bigint;
  processingCount: bigint;
  deliveredCount: bigint;
  cancelledCount: bigint;
}

// ─── Products ──────────────────────────────────────────────────────────────

export function useGetProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getProducts();
      return result as BackendProduct[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin check ───────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin", actor ? "actor" : "no-actor"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Orders ────────────────────────────────────────────────────────────────

export function useGetAllOrders(statusFilter?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<BackendOrder[]>({
    queryKey: ["orders", statusFilter ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllOrders(statusFilter ?? null);
      return result as BackendOrder[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Order stats ───────────────────────────────────────────────────────────

export function useGetOrderStats() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendStats>({
    queryKey: ["orderStats"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalOrders: BigInt(0),
          totalRevenue: 0,
          pendingCount: BigInt(0),
          processingCount: BigInt(0),
          deliveredCount: BigInt(0),
          cancelledCount: BigInt(0),
        };
      }
      const result = await actor.getOrderStats();
      return result as BackendStats;
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Place order ───────────────────────────────────────────────────────────

export interface PlaceOrderParams {
  productId: bigint;
  customerName: string;
  email: string;
  phone: string;
  quantity: bigint;
  notes: string;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, PlaceOrderParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.placeOrder(
        params.productId,
        params.customerName,
        params.email,
        params.phone,
        params.quantity,
        params.notes,
      );
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStats"] });
    },
  });
}

// ─── Update order status ───────────────────────────────────────────────────

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { orderId: bigint; status: string }>({
    mutationFn: async ({ orderId, status }) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.updateOrderStatus(orderId, status);
      if ("err" in result) throw new Error(result.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStats"] });
    },
  });
}

// ─── Add product ───────────────────────────────────────────────────────────

export interface AddProductParams {
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: bigint;
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, AddProductParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.addProduct(
        params.name,
        params.description,
        params.price,
        params.unit,
        params.stock,
      );
      return result as bigint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Update product ────────────────────────────────────────────────────────

export interface UpdateProductParams {
  id: bigint;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: bigint;
  isActive: boolean;
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateProductParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      await actor.updateProduct(
        params.id,
        params.name,
        params.description,
        params.price,
        params.unit,
        params.stock,
        params.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Deactivate product ────────────────────────────────────────────────────

export function useDeactivateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected to backend");
      await actor.deactivateProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Contact form ─────────────────────────────────────────────────────────

export interface BackendContactSubmission {
  id: bigint;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: bigint;
}

export interface SubmitContactFormParams {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function useSubmitContactForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, SubmitContactFormParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.submitContactForm(
        params.name,
        params.email,
        params.phone,
        params.message,
      );
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactSubmissions"] });
    },
  });
}

export function useGetContactSubmissions() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendContactSubmission[]>({
    queryKey: ["contactSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getContactSubmissions();
      return result as BackendContactSubmission[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Customer Profile ─────────────────────────────────────────────────────

export interface BackendCustomerProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  googleMapsLink: string;
}

export function useGetMyProfile(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<BackendCustomerProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMyProfile();
      if (!result) return null;
      return {
        name: result.name,
        email: result.email,
        phone: result.phone,
        location: result.location,
        googleMapsLink: result.googleMapsLink,
      };
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export interface RegisterProfileParams {
  name: string;
  email: string;
  phone: string;
  location: string;
  googleMapsLink: string;
}

export function useRegisterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, RegisterProfileParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.registerCustomerProfile(
        params.name,
        params.email,
        params.phone,
        params.location,
        params.googleMapsLink,
      );
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ─── Export CSV ────────────────────────────────────────────────────────────

export function useExportOrdersCSV() {
  const { actor } = useActor();
  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected to backend");
      return actor.exportOrdersCSV();
    },
    onSuccess: (csvContent) => {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dr-greens-orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
