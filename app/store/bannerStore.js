// store/useBannerStore.js

import { create } from "zustand";

import {
  getBannersService,
  getAdminBannersService,
  createBannerService,
  updateBannerService,
  deleteBannerService,
} from "../services/bannerService";

export const useBannerStore = create((set) => ({
  banners: [],

  fetchBanners: async () => {
    const res = await getBannersService();

    set({
      banners: res.data?.data || [],
    });
  },

  fetchAdminBanners: async () => {
    const res = await getAdminBannersService();

    set({
      banners: res.data?.data || [],
    });
  },

  createBanner: async (data) => {
    await createBannerService(data);
  },

  updateBanner: async (id, data) => {
    await updateBannerService(id, data);
  },

  deleteBanner: async (id) => {
    await deleteBannerService(id);
  },
}));
