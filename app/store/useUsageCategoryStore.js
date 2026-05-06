// store/useUsageCategoryStore.js

import { create } from "zustand";
import {
  getUsageCategories,
  createUsageCategory,
  updateUsageCategory,
  deleteUsageCategory,
} from "../services/usageCategoryService";

export const useUsageCategoryStore = create((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await getUsageCategories({ page: 1, limit: 100 });

      set({
        categories: res.data.data.data,
        loading: false,
      });
    } catch (err) {
      console.log(err);
      set({ loading: false });
    }
  },

  createCategory: async (data) => {
    await createUsageCategory(data);
  },

  updateCategory: async (id, data) => {
    await updateUsageCategory(id, data);
  },

  deleteCategory: async (id) => {
    await deleteUsageCategory(id);
  },
}));
