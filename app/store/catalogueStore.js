// /store/catalogueStore.js

import { create } from "zustand";
import {
  getCatalogueService,
  createCatalogueService,
  updateCatalogueService,
  deleteCatalogueService,
} from "../services/catalogueService";

export const useCatalogueStore = create((set, get) => ({
  catalogues: [],
  loading: false,
  error: null,

  // ✅ FETCH
  fetchCatalogues: async () => {
    try {
      const res = await getCatalogueService();

      set({
        catalogues: res.data?.data?.data || [],
      });
    } catch (err) {
      console.log("FETCH ERROR", err);
    }
  },

  // ✅ CREATE
  createCatalogue: async (data) => {
    try {
      set({ loading: true });

      await createCatalogueService(data);

      // 🔥 auto refresh
      await get().fetchCatalogues();

      set({ loading: false });
    } catch (err) {
      console.error("CREATE ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
      throw err; // important for UI handling
    }
  },

  // ✅ UPDATE
  updateCatalogue: async (id, data) => {
    try {
      set({ loading: true });

      await updateCatalogueService(id, data);

      await get().fetchCatalogues();

      set({ loading: false });
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
      throw err;
    }
  },

  // ✅ DELETE
  deleteCatalogue: async (id) => {
    try {
      set({ loading: true });

      await deleteCatalogueService(id);

      await get().fetchCatalogues();

      set({ loading: false });
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
    }
  },
}));
