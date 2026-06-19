import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../services/couponService";

export const COUPONS_KEY = ["coupons"];

export function useAdminCoupons(params) {
  return useQuery({
    queryKey: [...COUPONS_KEY, params],
    queryFn: () =>
      getAdminCoupons(params).then((r) => ({
        data: r.data?.data ?? [],
        pagination: r.data?.pagination ?? {},
      })),
    placeholderData: (prev) => prev,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      toast.success("Coupon created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      toast.success("Coupon updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      toast.success("Coupon deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    },
  });
}
