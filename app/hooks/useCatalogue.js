import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getCatalogueService,
  createCatalogueService,
  updateCatalogueService,
  deleteCatalogueService,
} from "../services/catalogueService";

export const CATALOGUE_KEY = ["catalogue"];

const extract = (r) => {
  const raw = r.data?.data;
  if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.data) {
    return { data: raw.data, pagination: raw.pagination ?? {} };
  }
  return { data: Array.isArray(raw) ? raw : [], pagination: {} };
};

export function useCatalogue(params) {
  return useQuery({
    queryKey: [...CATALOGUE_KEY, params],
    queryFn: () => getCatalogueService(params).then(extract),
    placeholderData: (prev) => prev,
  });
}

export function useCreateCatalogue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCatalogueService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOGUE_KEY });
      toast.success("Catalogue created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create catalogue");
    },
  });
}

export function useUpdateCatalogue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCatalogueService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOGUE_KEY });
      toast.success("Catalogue updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update catalogue");
    },
  });
}

export function useDeleteCatalogue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCatalogueService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOGUE_KEY });
      toast.success("Catalogue deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete catalogue");
    },
  });
}
