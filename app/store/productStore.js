import { create } from "zustand";
import {
  createProductService,
  getProductsService,
  updateProductService,
} from "../services/productService";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  // ✅ Create
  createProduct: async (data) => {
    set({ loading: true });
    try {
      const res = await createProductService(data);

      set((state) => ({
        products: [...state.products, res.data.product],
      }));
    } catch (err) {
      console.log("Create error:", err.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update
  updateProduct: async (id, data) => {
    set({ loading: true });
    try {
      const res = await updateProductService(id, data);

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? res.data.product : p
        ),
      }));
    } catch (err) {
      console.log("Update error:", err.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async (query) => {
    try {
      const res = await getProductsService(query);

      set({
        products: res.data?.data || [],
      });
    } catch (err) {
      console.error(err);
    }
  },
}));
