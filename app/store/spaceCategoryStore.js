import { create } from "zustand";
import {
  getSpaceCategoriesService,
  createSpaceCategoryService,
  updateSpaceCategoryService,
  deleteSpaceCategoryService,
} from "../services/authServices";

export const useSpaceCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // ✅ FETCH
  fetchCategories: async () => {
    try {
      set({ loading: true });

      const res = await getSpaceCategoriesService();

      set({
        categories: res?.data?.data?.data || [],
        loading: false,
      });
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
    }
  },

  // ✅ CREATE
  createCategory: async (data) => {
    try {
      set({ loading: true });

      await createSpaceCategoryService(data);

      // 🔥 auto refresh
      await get().fetchCategories();

      set({ loading: false });
    } catch (err) {
      console.error("CREATE ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
      throw err;
    }
  },

  // ✅ UPDATE
  updateCategory: async (id, data) => {
    try {
      set({ loading: true });

      await updateSpaceCategoryService(id, data);

      await get().fetchCategories();

      set({ loading: false });
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
      throw err;
    }
  },

  // ✅ DELETE
  deleteCategory: async (id) => {
    try {
      set({ loading: true });

      await deleteSpaceCategoryService(id);

      await get().fetchCategories();

      set({ loading: false });
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data);
      set({ error: err.response?.data, loading: false });
    }
  },
}));
