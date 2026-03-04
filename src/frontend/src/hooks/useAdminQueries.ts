import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminActor } from "./useAdminActor";

// ─── Re-export shared types from useQueries ─────────────────────────────────

export type {
  BackendProduct,
  BackendOrder,
  BackendStats,
  BackendReview,
  BackendBanner,
  BackendStoreSettings,
  BackendContactSubmission,
  BackendCustomerProfileWithPrincipal,
  AddProductParams,
  UpdateProductParams,
  CreateBannerParams,
  UpdateBannerParams,
  UpdateStoreSettingsParams,
} from "./useQueries";

// ─── Products (admin) ────────────────────────────────────────────────────────

import type {
  AddProductParams,
  BackendBanner,
  BackendContactSubmission,
  BackendCustomerProfileWithPrincipal,
  BackendOrder,
  BackendProduct,
  BackendReview,
  BackendStats,
  BackendStoreSettings,
  CreateBannerParams,
  UpdateBannerParams,
  UpdateProductParams,
  UpdateStoreSettingsParams,
} from "./useQueries";

export function useGetProductsAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendProduct[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getProducts();
      return result as BackendProduct[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProductAdmin() {
  const { actor } = useAdminActor();
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
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductAdmin() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateProductParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.updateProduct(
        params.id,
        params.name,
        params.description,
        params.price,
        params.unit,
        params.stock,
        params.isActive,
      );
      if ("err" in result) throw new Error(result.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeactivateProductAdmin() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected to backend");
      await actor.deactivateProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Orders (admin) ──────────────────────────────────────────────────────────

export function useGetAllOrdersAdmin(statusFilter?: string) {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendOrder[]>({
    queryKey: ["admin-orders", statusFilter ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllOrders(statusFilter ?? null);
      return result as BackendOrder[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrderStatsAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendStats>({
    queryKey: ["admin-orderStats"],
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

export function useUpdateOrderStatusAdmin() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { orderId: bigint; status: string }>({
    mutationFn: async ({ orderId, status }) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.updateOrderStatus(orderId, status);
      if ("err" in result) throw new Error(result.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orderStats"] });
    },
  });
}

export function useExportOrdersCSVAdmin() {
  const { actor } = useAdminActor();
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
      a.download = `verdant-greens-orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

// ─── Customers (admin) ───────────────────────────────────────────────────────

export function useGetAllCustomerProfilesAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendCustomerProfileWithPrincipal[]>({
    queryKey: ["admin-allCustomerProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllCustomerProfiles();
      return result as BackendCustomerProfileWithPrincipal[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Contact Submissions (admin) ─────────────────────────────────────────────

export function useGetContactSubmissionsAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendContactSubmission[]>({
    queryKey: ["admin-contactSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getContactSubmissions();
      return result as BackendContactSubmission[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Banners (admin) ─────────────────────────────────────────────────────────

export function useGetAllBannersAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendBanner[]>({
    queryKey: ["admin-allBanners"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllBanners();
      return result as BackendBanner[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBannerAdmin() {
  const { actor } = useAdminActor();
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
      queryClient.invalidateQueries({ queryKey: ["admin-allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["activeBanners"] });
    },
  });
}

export function useUpdateBannerAdmin() {
  const { actor } = useAdminActor();
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
      queryClient.invalidateQueries({ queryKey: ["admin-allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["activeBanners"] });
    },
  });
}

export function useDeleteBannerAdmin() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.deleteBanner(id);
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["activeBanners"] });
    },
  });
}

// ─── Reviews (admin) ─────────────────────────────────────────────────────────

export function useGetAllReviewsAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendReview[]>({
    queryKey: ["admin-allReviews"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllReviews();
      return result as BackendReview[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Store Settings (admin) ──────────────────────────────────────────────────

export function useGetStoreSettingsAdmin() {
  const { actor, isFetching } = useAdminActor();
  return useQuery<BackendStoreSettings>({
    queryKey: ["admin-storeSettings"],
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

export function useUpdateStoreSettingsAdmin() {
  const { actor } = useAdminActor();
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
      queryClient.invalidateQueries({ queryKey: ["admin-storeSettings"] });
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
    },
  });
}
