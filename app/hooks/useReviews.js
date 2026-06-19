import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAdminReviewsService,
  getProductReviewsService,
  createReviewService,
  updateReviewService,
  deleteReviewService,
} from "../services/reviewService";

export const REVIEWS_KEY = ["reviews"];

export function useAdminReviews(params) {
  return useQuery({
    queryKey: [...REVIEWS_KEY, "admin", params],
    queryFn: () =>
      getAdminReviewsService(params).then((r) => ({
        data: r.data?.data ?? [],
        pagination: r.data?.pagination ?? {},
      })),
    placeholderData: (prev) => prev,
  });
}

export function useProductReviews(productId) {
  return useQuery({
    queryKey: [...REVIEWS_KEY, "product", productId],
    queryFn: () =>
      getProductReviewsService(productId).then((r) => r.data?.data || []),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) => createReviewService(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_KEY });
      toast.success("Review submitted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateReviewService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_KEY });
      toast.success("Review updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update review");
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteReviewService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_KEY });
      toast.success("Review deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete review");
    },
  });
}
