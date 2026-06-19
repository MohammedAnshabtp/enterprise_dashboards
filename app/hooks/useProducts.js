import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProductsService,
  createProductService,
  updateProductService,
  getProductBySlugService,
  toggleProductStatusService,
  toggleProductFeatureService,
} from "../services/productsService";
import { deleteProductService } from "../services/productService";

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
