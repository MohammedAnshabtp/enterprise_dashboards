import { create } from "zustand";
import {
  getSpaceCategoriesService,
  createSpaceCategoryService,
  updateSpaceCategoryService,
  deleteSpaceCategoryService,
} from "../services/categoryService";

export const useSpaceCategoryStore = create((set) => ({
  categories: [],
  pagination: {},
  loading: false,

  fetchCategories: async (params = {}) => {
    try {
      set({ loading: true });

      const res = await getSpaceCategoriesService(params);

      console.log("SPACE API RESPONSE", res.data);

      set({
        categories: Array.isArray(res.data?.data) ? res.data.data : [],

        pagination: res.data?.pagination || {},

        loading: false,
      });
    } catch (err) {
      console.log(err);

      set({
        categories: [],
        loading: false,
      });
    }
  },

  createCategory: async (payload) => {
    return await createSpaceCategoryService(payload);
  },

  updateCategory: async (id, payload) => {
    return await updateSpaceCategoryService(id, payload);
  },

  deleteCategory: async (id) => {
    return await deleteSpaceCategoryService(id);
  },
}));
