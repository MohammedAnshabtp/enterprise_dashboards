import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getCatalogueService,
  createCatalogueService,
  updateCatalogueService,
  deleteCatalogueService,
} from "../services/catalogueService";

export const CATALOGUE_KEY = ["catalogue"];

export function useCatalogue() {
  return useQuery({
    queryKey: CATALOGUE_KEY,
    queryFn: () => getCatalogueService().then((r) => r.data?.data || []),
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
