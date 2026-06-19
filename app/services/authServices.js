// services/authService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

export const login = (data) => api.post(ENDPOINTS.LOGIN, data);
export const signup = (data) => api.post(ENDPOINTS.SIGNUP, data);
export const getProfile = () => api.get(ENDPOINTS.GET_PROFILE);

export const sendOtp = (email) => api.post(ENDPOINTS.SEND_EMAIL_OTP, { email });
export const verifyOtp = (data) => api.post(ENDPOINTS.VERIFY_EMAIL_OTP, data);
export const forgotPassword = (email) =>
  api.post(ENDPOINTS.FORGET_PASSWORD, { email });
export const updatePassword = (data) => api.patch(ENDPOINTS.UPDATE_PASSWORD, data);

export const updateProfileService = (data) => {
  return api.patch(ENDPOINTS.UPDATE_PROFILE, data);
};

export const uploadAvatarService = (file) => {
  const formData = new FormData();

  // ✅ FIX HERE
  formData.append("image", file);

  return api.patch(ENDPOINTS.UPLOAD_AVATAR, formData);
};

export const deleteAvatarService = () => {
  return api.delete(ENDPOINTS.DELETE_AVATAR);
};

export const getAllUsersService = (params) => api.get(ENDPOINTS.GET_ALL_USERS, { params });
export const deleteUserService = (id) => api.delete(ENDPOINTS.DELETE_USER(id));
export const updateUserStatusService = (id, activeStatus) =>
  api.patch(ENDPOINTS.UPDATE_USER_STATUS, { id, activeStatus });

// GET
export const getSizeCategoriesService = (params) => {
  return api.get(ENDPOINTS.GET_SIZE_CATEGORY, { params });
};

// CREATE
export const createSizeCategoryService = (data) => {
  return api.post(ENDPOINTS.CREATE_SIZE_CATEGORY, data);
};

// UPDATE
export const updateSizeCategoryService = (id, data) => {
  return api.patch(ENDPOINTS.UPDATE_SIZE_CATEGORY(id), data);
};

// DELETE
export const deleteSizeCategoryService = (id) => {
  return api.delete(ENDPOINTS.DELETE_SIZE_CATEGORY(id));
};
