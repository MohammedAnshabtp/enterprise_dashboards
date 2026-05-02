import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// ✅ GET
export const getWishlistService = () => {
  return api.get(ENDPOINTS.GET_WISHLIST);
};

// ✅ TOGGLE
export const toggleWishlistService = (productId) => {
  return api.post(ENDPOINTS.TOGGLE_WISHLIST, { productId });
};

// ✅ REMOVE
export const removeWishlistService = (productId) => {
  return api.delete(ENDPOINTS.REMOVE_WISHLIST(productId));
};

// ✅ CLEAR
export const clearWishlistService = () => {
  return api.delete(ENDPOINTS.CLEAR_WISHLIST);
};
