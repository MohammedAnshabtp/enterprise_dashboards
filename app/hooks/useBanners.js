import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getBannersService,
  getAdminBannersService,
  createBannerService,
  updateBannerService,
  deleteBannerService,
} from "../services/bannerService";

export const BANNERS_KEY = ["banners"];
export const ADMIN_BANNERS_KEY = ["banners", "admin"];

export function useBanners() {
  return useQuery({
    queryKey: BANNERS_KEY,
    queryFn: () => getBannersService().then((r) => r.data?.data || []),
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ADMIN_BANNERS_KEY,
    queryFn: () => getAdminBannersService().then((r) => r.data?.data || []),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBannerService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_KEY });
      toast.success("Banner created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create banner");
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBannerService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_KEY });
      toast.success("Banner updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update banner");
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBannerService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_KEY });
      toast.success("Banner deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete banner");
    },
  });
}
