import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProductStyleService,
  createProductStyleService,
  updateProductStyleService,
  deleteProductStyleService,
} from "../services/productStyleService";

export const PRODUCT_STYLE_KEY = ["product-style"];

export function useProductStyle(params) {
  return useQuery({
    queryKey: [...PRODUCT_STYLE_KEY, params],
    queryFn: () =>
      getProductStyleService(params).then((r) => r.data?.data || []),
  });
}

export function useCreateProductStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductStyleService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_STYLE_KEY });
      toast.success("Style created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create style");
    },
  });
}

export function useUpdateProductStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProductStyleService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_STYLE_KEY });
      toast.success("Style updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update style");
    },
  });
}

export function useDeleteProductStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProductStyleService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_STYLE_KEY });
      toast.success("Style deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete style");
    },
  });
}
