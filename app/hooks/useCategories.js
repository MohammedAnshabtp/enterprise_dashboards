import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getSizeCategoriesService,
  createSizeCategoryService,
  updateSizeCategoryService,
  deleteSizeCategoryService,
} from "../services/authServices";
import {
  getSpaceCategoriesService,
  getTileUsageCategoriesService,
  createSpaceCategoryService,
  updateSpaceCategoryService,
  deleteSpaceCategoryService,
} from "../services/categoryService";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SIZE_CATEGORIES_KEY = ["categories", "size"];
export const SPACE_CATEGORIES_KEY = ["categories", "space"];
export const TILE_USAGE_CATEGORIES_KEY = ["categories", "tile-usage"];

// ─── Size categories ──────────────────────────────────────────────────────────

export function useSizeCategories(params) {
  return useQuery({
    queryKey: [...SIZE_CATEGORIES_KEY, params],
    queryFn: () =>
      getSizeCategoriesService(params).then(
        (r) => r.data?.data?.data || r.data?.data || []
      ),
  });
}

export function useCreateSizeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSizeCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIZE_CATEGORIES_KEY });
      toast.success("Size category created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create size category");
    },
  });
}

export function useUpdateSizeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSizeCategoryService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIZE_CATEGORIES_KEY });
      toast.success("Size category updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update size category");
    },
  });
}

export function useDeleteSizeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSizeCategoryService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIZE_CATEGORIES_KEY });
      toast.success("Size category deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete size category");
    },
  });
}

// ─── Space categories ─────────────────────────────────────────────────────────

export function useSpaceCategories(params) {
  return useQuery({
    queryKey: [...SPACE_CATEGORIES_KEY, params],
    queryFn: () =>
      getSpaceCategoriesService(params).then(
        (r) => r.data?.data?.data || r.data?.data || []
      ),
  });
}

export function useCreateSpaceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpaceCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPACE_CATEGORIES_KEY });
      toast.success("Space category created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create space category");
    },
  });
}

export function useUpdateSpaceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSpaceCategoryService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPACE_CATEGORIES_KEY });
      toast.success("Space category updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update space category");
    },
  });
}

export function useDeleteSpaceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSpaceCategoryService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPACE_CATEGORIES_KEY });
      toast.success("Space category deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete space category");
    },
  });
}

// ─── Tile usage categories ────────────────────────────────────────────────────

export function useTileUsageCategories() {
  return useQuery({
    queryKey: TILE_USAGE_CATEGORIES_KEY,
    queryFn: () =>
      getTileUsageCategoriesService().then(
        (r) => r.data?.data?.data || r.data?.data || []
      ),
  });
}
