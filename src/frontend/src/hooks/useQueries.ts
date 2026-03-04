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
  deliveryDate: string;
  deliverySlot: string;
  discount: number;
}

export interface BackendStats {
  totalOrders: bigint;
  totalRevenue: number;
  pendingCount: bigint;
  processingCount: bigint;
  deliveredCount: bigint;
  cancelledCount: bigint;
  outForDeliveryCount: bigint;
}

export interface BackendReview {
  id: bigint;
  productId: bigint;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: bigint;
  comment: string;
  createdAt: bigint;
}

export interface BackendBanner {
  id: bigint;
  title: string;
  description: string;
  badgeText: string;
  isActive: boolean;
  createdAt: bigint;
}

export interface BackendStoreSettings {
  whatsappNumber: string;
  businessAddress: string;
  deliveryZones: string;
  isStoreOpen: boolean;
  lowStockThreshold: bigint;
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
          outForDeliveryCount: BigInt(0),
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
  deliveryDate: string;
  deliverySlot: string;
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
        params.deliveryDate,
        params.deliverySlot,
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

// ─── My Orders (customer's own orders) ────────────────────────────────────

export function useGetMyOrders(email: string) {
  const { actor, isFetching } = useActor();
  return useQuery<BackendOrder[]>({
    queryKey: ["myOrders", email],
    queryFn: async () => {
      if (!actor || !email) return [];
      const result = await actor.getAllOrders(null);
      const all = result as BackendOrder[];
      return all.filter((o) => o.email === email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

// ─── All Customer Profiles (admin) ───────────────────────────────────────

export interface BackendCustomerProfileWithPrincipal {
  name: string;
  email: string;
  phone: string;
  location: string;
  googleMapsLink: string;
  createdAt: bigint;
}

export function useGetAllCustomerProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendCustomerProfileWithPrincipal[]>({
    queryKey: ["allCustomerProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllCustomerProfiles();
      return result as BackendCustomerProfileWithPrincipal[];
    },
    enabled: !!actor && !isFetching,
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

// ─── Banners ──────────────────────────────────────────────────────────────

export function useGetActiveBanners() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendBanner[]>({
    queryKey: ["activeBanners"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getActiveBanners();
      return result as BackendBanner[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBanners() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendBanner[]>({
    queryKey: ["allBanners"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllBanners();
      return result as BackendBanner[];
    },
    enabled: !!actor && !isFetching,
  });
}

export interface CreateBannerParams {
  title: string;
  description: string;
  badgeText: string;
}

export function useCreateBanner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, CreateBannerParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.createBanner(
        params.title,
        params.description,
        params.badgeText,
      );
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["activeBanners"] });
    },
  });
}

export interface UpdateBannerParams {
  id: bigint;
  title: string;
  description: string;
  badgeText: string;
  isActive: boolean;
}

export function useUpdateBanner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateBannerParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.updateBanner(
        params.id,
        params.title,
        params.description,
        params.badgeText,
        params.isActive,
      );
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["activeBanners"] });
    },
  });
}

export function useDeleteBanner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.deleteBanner(id);
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["activeBanners"] });
    },
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────

export function useGetProductReviews(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<BackendReview[]>({
    queryKey: ["productReviews", productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) return [];
      const result = await actor.getProductReviews(productId);
      return result as BackendReview[];
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendReview[]>({
    queryKey: ["allReviews"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllReviews();
      return result as BackendReview[];
    },
    enabled: !!actor && !isFetching,
  });
}

export interface SubmitReviewParams {
  productId: bigint;
  productName: string;
  customerEmail: string;
  customerName: string;
  rating: bigint;
  comment: string;
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, SubmitReviewParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.submitReview(
        params.productId,
        params.productName,
        params.customerEmail,
        params.customerName,
        params.rating,
        params.comment,
      );
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productReviews", variables.productId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    },
  });
}

// ─── Store Settings ───────────────────────────────────────────────────────

export function useGetStoreSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<BackendStoreSettings>({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      if (!actor) {
        return {
          whatsappNumber: "",
          businessAddress: "",
          deliveryZones: "",
          isStoreOpen: true,
          lowStockThreshold: BigInt(5),
        };
      }
      const result = await actor.getStoreSettings();
      return result as BackendStoreSettings;
    },
    enabled: !!actor && !isFetching,
  });
}

export interface UpdateStoreSettingsParams {
  whatsappNumber: string;
  businessAddress: string;
  deliveryZones: string;
  isStoreOpen: boolean;
  lowStockThreshold: bigint;
}

export function useUpdateStoreSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateStoreSettingsParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.updateStoreSettings(
        params.whatsappNumber,
        params.businessAddress,
        params.deliveryZones,
        params.isStoreOpen,
        params.lowStockThreshold,
      );
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
    },
  });
}
