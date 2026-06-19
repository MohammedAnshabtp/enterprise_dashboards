"use client";

import { create } from "zustand";

import { getSizeCategoriesService } from "../services/authServices";
import {
  getSpaceCategoriesService,
  getTileUsageCategoriesService,
} from "../services/categoryService";

export const useCategoryStore = create((set) => ({
  sizeCategories: [],
  spaceCategories: [],
  tileUsageCategories: [],

  // SIZE
  fetchSizeCategories: async () => {
    try {
      const res = await getSizeCategoriesService();

      console.log("SIZE CATEGORY:", res.data);

      set({
        sizeCategories: res.data?.data?.data || [],
      });
    } catch (error) {
      console.log(error);
    }
  },

  // SPACE
  fetchSpaceCategories: async () => {
    try {
      const res = await getSpaceCategoriesService();

      console.log("SPACE CATEGORY:", res.data);

      set({
        spaceCategories: res.data?.data?.data || [],
      });
    } catch (error) {
      console.log(error);
    }
  },

  // TILE USAGE
  fetchTileUsageCategories: async () => {
    try {
      const res = await getTileUsageCategoriesService();

      console.log("TILE USAGE CATEGORY:", res.data);

      set({
        tileUsageCategories: res.data?.data?.data || [],
      });
    } catch (error) {
      console.log(error);
    }
  },
}));
