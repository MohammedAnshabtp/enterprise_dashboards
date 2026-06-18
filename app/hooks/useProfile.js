import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProfile,
  updateProfileService,
  uploadAvatarService,
  deleteAvatarService,
} from "../services/authServices";

export const PROFILE_KEY = ["profile"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => getProfile().then((r) => r.data?.data || null),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadAvatarService(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Avatar updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvatarService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Avatar removed");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to remove avatar");
    },
  });
}
