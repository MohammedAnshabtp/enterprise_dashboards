// services/couponService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// USER
export const validateCoupon = (data) =>
  api.post(ENDPOINTS.VALIDATE_COUPON, data);

// ADMIN
export const getAdminCoupons = (params) =>
  api.get(ENDPOINTS.GET_ADMIN_COUPONS, { params });

export const createCoupon = (data) => api.post(ENDPOINTS.CREATE_COUPON, data);

export const updateCoupon = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_COUPON(id), data);

export const deleteCoupon = (id) => api.delete(ENDPOINTS.DELETE_COUPON(id));
