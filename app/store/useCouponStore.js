// store/useCouponStore.js

import { create } from "zustand";
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../services/couponService";

export const useCouponStore = create((set) => ({
  coupons: [],
  loading: false,
  discount: null,

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

  applyCoupon: async (code) => {
    try {
      const res = await validateCoupon({ code });

      set({
        discount: res.data.data,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
}));
