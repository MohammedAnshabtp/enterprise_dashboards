import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProductsService,
  createProductService,
  updateProductService,
  getProductBySlugService,
  toggleProductStatusService,
  toggleProductFeatureService,
  bulkUploadProductsService,
  getBulkUploadStatusService,
  getBulkUploadHistoryService,
  getBulkUploadJobService,
} from "../services/productsService";
import { deleteProductService } from "../services/productService";
import { bulkDeleteProductsService, getBulkDeleteStatusService, bulkCategoryUpdateService } from "../services/productBulkService";

export const PRODUCTS_KEY = ["products"];

export function useProducts(params) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () =>
      getProductsService(params).then((r) => ({
        data: r.data?.data ?? [],
        pagination: r.data?.pagination ?? {},
      })),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Product created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProductService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Product updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProductService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Product deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete product");
    },
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlugService(slug).then((r) => r.data?.data ?? null),
    enabled: !!slug,
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => toggleProductStatusService(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Product status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });
}

export function useToggleProductFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => toggleProductFeatureService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Featured status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update featured");
    },
  });
}

export function useBulkUploadProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, stockOnly }) => bulkUploadProductsService(file, stockOnly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Bulk upload failed");
    },
  });
}

export function useBulkUploadStatus(jobId) {
  return useQuery({
    queryKey: ["bulk-upload-status", jobId],
    queryFn: () => getBulkUploadStatusService(jobId).then((r) => r.data?.data ?? null),
    enabled: !!jobId,
    // Poll every 15s to stay well within the server's 100 req/15min rate limit.
    // Users can trigger an immediate refresh via the manual Refresh button.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 15000;
    },
  });
}

export const BULK_HISTORY_KEY = ["bulk-upload-history"];

export function useBulkUploadHistory(params = {}) {
  return useQuery({
    queryKey: [...BULK_HISTORY_KEY, params],
    queryFn: () =>
      getBulkUploadHistoryService(params).then((r) => ({
        data: r.data?.data ?? [],
        pagination: r.data?.pagination ?? {},
      })),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}

export function useBulkCategoryUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => bulkCategoryUpdateService(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Categories updated for selected products");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Bulk category update failed");
    },
  });
}

export function useBulkDeleteProducts() {
  return useMutation({
    mutationFn: (productIds) => bulkDeleteProductsService(productIds).then((r) => r.data),
    onError: (err) => {
      toast.error(err.response?.data?.message || "Bulk delete failed");
    },
  });
}

export function useBulkDeleteStatus(jobId) {
  return useQuery({
    queryKey: ["bulk-delete-status", jobId],
    queryFn: () => getBulkDeleteStatusService(jobId).then((r) => r.data?.data ?? null),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === "completed" || s === "failed") return false;
      return 3000;
    },
  });
}

export function useBulkUploadJob(jobId) {
  return useQuery({
    queryKey: ["bulk-upload-job", jobId],
    queryFn: () => getBulkUploadJobService(jobId).then((r) => r.data?.data ?? null),
    enabled: !!jobId,
    staleTime: 1000 * 60,
  });
}
