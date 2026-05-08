// /store/productStyleStore.js

import { create } from "zustand";
import {
  getProductStyleService,
  createProductStyleService,
  updateProductStyleService,
  deleteProductStyleService,
} from "../services/productStyleService";

export const useProductStyleStore = create((set) => ({
  styles: [],
  loading: false,

  fetchStyles: async () => {
    set({ loading: true });

    try {
      const res = await getProductStyleService({ page: 1, limit: 100 });

      set({
        styles: res.data?.data?.data || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  createStyle: async (data) => {
    await createProductStyleService(data);
  },

  updateStyle: async (id, data) => {
    await updateProductStyleService(id, data);
  },

  deleteStyle: async (id) => {
    await deleteProductStyleService(id);
  },
}));
