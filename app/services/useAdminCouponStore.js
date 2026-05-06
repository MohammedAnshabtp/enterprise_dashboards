// store/useAdminCouponStore.js

import { create } from "zustand";
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../services/adminCouponService";

export const useAdminCouponStore = create((set) => ({
  coupons: [],
  loading: false,

  fetchCoupons: async () => {
    set({ loading: true });

    try {
      const res = await getAdminCoupons({ page: 1, limit: 50 });

      set({
        coupons: res.data.data,
        loading: false,
      });
    } catch (err) {
      console.log(err);
      set({ loading: false });
    }
  },

  createCoupon: async (data) => {
    await createCoupon(data);
  },

  updateCoupon: async (id, data) => {
    await updateCoupon(id, data);
  },

  deleteCoupon: async (id) => {
    await deleteCoupon(id);
  },
}));
