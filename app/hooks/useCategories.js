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
  createSpaceCategoryService,
  updateSpaceCategoryService,
  deleteSpaceCategoryService,
  getTileUsageCategoriesService,
  createTileUsageCategoryService,
  updateTileUsageCategoryService,
  deleteTileUsageCategoryService,
} from "../services/categoryService";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SIZE_CATEGORIES_KEY       = ["categories", "size"];
export const SPACE_CATEGORIES_KEY      = ["categories", "space"];
export const TILE_USAGE_CATEGORIES_KEY = ["categories", "tile-usage"];

// ─── Response extractors ──────────────────────────────────────────────────────

// Space backend: { success, data: [], pagination: {} }
const extractSpace = (r) => ({
  data: r.data?.data ?? [],
  pagination: r.data?.pagination ?? {},
});

// Size / Style / TileUsage backend: { success, data: paginateResult | [] }
const extractPaginated = (r) => {
  const raw = r.data?.data;
  if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.data) {
    return { data: raw.data, pagination: raw.pagination ?? {} };
  }
  return { data: Array.isArray(raw) ? raw : [], pagination: {} };
};

// ─── Size categories ──────────────────────────────────────────────────────────

export function useSizeCategories(params) {
  return useQuery({
    queryKey: [...SIZE_CATEGORIES_KEY, params],
    queryFn: () => getSizeCategoriesService(params).then(extractPaginated),
    placeholderData: (prev) => prev,
    enabled: !!params,
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
    queryFn: () => getSpaceCategoriesService(params).then(extractSpace),
    placeholderData: (prev) => prev,
    enabled: !!params,
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

export function useTileUsageCategories(params) {
  return useQuery({
    queryKey: [...TILE_USAGE_CATEGORIES_KEY, params],
    queryFn: () => getTileUsageCategoriesService(params).then(extractPaginated),
    placeholderData: (prev) => prev,
    enabled: !!params,
  });
}

export function useCreateTileUsageCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTileUsageCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TILE_USAGE_CATEGORIES_KEY });
      toast.success("Tile usage category created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create tile usage category");
    },
  });
}

export function useUpdateTileUsageCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTileUsageCategoryService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TILE_USAGE_CATEGORIES_KEY });
      toast.success("Tile usage category updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update tile usage category");
    },
  });
}

export function useDeleteTileUsageCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTileUsageCategoryService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TILE_USAGE_CATEGORIES_KEY });
      toast.success("Tile usage category deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete tile usage category");
    },
  });
}
