"use client";

import { create } from "zustand";

import {
  bulkUploadProductsService,
  getBulkUploadHistoryService,
  getBulkUploadStatusService,
  bulkDeleteProductsService,
  getBulkDeleteStatusService,
  bulkCategoryUpdateService,
} from "../services/productBulkService";

export const useProductBulkStore = create((set) => ({
  uploadHistory: [],
  uploadStatus: null,
  deleteStatus: null,
  loading: false,

  // ================= BULK UPLOAD =================

  bulkUploadProducts: async (file) => {
    try {
      set({ loading: true });

      const res = await bulkUploadProductsService(file);

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ================= HISTORY =================

  fetchBulkUploadHistory: async () => {
    try {
      set({ loading: true });

      const res = await getBulkUploadHistoryService();

      set({
        uploadHistory: res.data?.data || [],
      });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },

  // ================= UPLOAD STATUS =================

  fetchBulkUploadStatus: async (jobId) => {
    try {
      set({ loading: true });

      const res = await getBulkUploadStatusService(jobId);

      set({
        uploadStatus: res.data?.data,
      });

      return res.data;
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },

  // ================= BULK DELETE =================

  bulkDeleteProducts: async (productIds) => {
    try {
      set({ loading: true });

      const res = await bulkDeleteProductsService(productIds);

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ================= DELETE STATUS =================

  fetchBulkDeleteStatus: async (jobId) => {
    try {
      set({ loading: true });

      const res = await getBulkDeleteStatusService(jobId);

      set({
        deleteStatus: res.data?.data,
      });

      return res.data;
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },

  // ================= BULK CATEGORY UPDATE =================

  bulkCategoryUpdate: async (payload) => {
    try {
      set({ loading: true });

      const res = await bulkCategoryUpdateService(payload);

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
