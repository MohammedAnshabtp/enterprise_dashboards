import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllUsersService,
  deleteUserService,
  updateUserStatusService,
} from "../services/authServices";

export const USERS_KEY = ["users"];

export function useUsers(params) {
  return useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () =>
      getAllUsersService(params).then((r) => r.data?.data ?? { data: [], pagination: {} }),
    placeholderData: (prev) => prev,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUserService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("User deleted successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete user");
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activeStatus }) => updateUserStatusService(id, activeStatus),
    onSuccess: (_, { activeStatus }) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success(activeStatus ? "User activated" : "User deactivated");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to update status");
    },
  });
}
