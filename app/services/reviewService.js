// services/reviewService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// PRODUCT REVIEWS
export const getProductReviewsService = (productId) =>
  api.get(ENDPOINTS.GET_PRODUCT_REVIEWS(productId));

export const createReviewService = (productId, data) => {
  return api.post(ENDPOINTS.CREATE_REVIEW(productId), {
    rating: data.rating,
    comment: data.comment,
  });
};

export const updateReviewService = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_REVIEW(id), data);

export const deleteReviewService = (id) =>
  api.delete(ENDPOINTS.DELETE_REVIEW(id));

// ADMIN REVIEWS
export const getAdminReviewsService = (params) =>
  api.get(ENDPOINTS.GET_ADMIN_REVIEWS, { params });
