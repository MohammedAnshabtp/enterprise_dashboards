import { create } from "zustand";
import {
  getSpaceCategoriesService,
  createSpaceCategoryService,
  updateSpaceCategoryService,
  deleteSpaceCategoryService,
} from "../services/authServices";

export const useSpaceCategoryStore = create((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    try {
      set({ loading: true });

      const res = await getSpaceCategoriesService({ page: 1, limit: 100 });

      console.log("SPACE API RESPONSE", res.data);

      set({
        categories: res.data?.data?.data || res.data?.data || [],
        loading: false,
      });
    } catch (err) {
      console.log(err);
      set({ loading: false });
    }
  },

  createCategory: async (payload) => {
    await createSpaceCategoryService(payload);
  },

  updateCategory: async (id, payload) => {
    await updateSpaceCategoryService(id, payload);
  },

  deleteCategory: async (id) => {
    await deleteSpaceCategoryService(id);
  },
}));
