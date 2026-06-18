import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProductsService,
  createProductService,
  updateProductService,
} from "../services/productsService";
import { deleteProductService } from "../services/productService";

export const PRODUCTS_KEY = ["products"];

export function useProducts(params) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () => getProductsService(params).then((r) => r.data?.data || []),
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
