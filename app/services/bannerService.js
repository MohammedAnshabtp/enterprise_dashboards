// services/bannerService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// ======================
// GET BANNERS
// ======================

export const getBannersService = () => api.get(ENDPOINTS.GET_BANNERS);

export const getAdminBannersService = () =>
  api.get(ENDPOINTS.GET_ADMIN_BANNERS);

// ======================
// CREATE BANNER
// ======================

export const createBannerService = async (data) => {
  const formData = new FormData();

  // REQUIRED
  formData.append("title", data.title);

  // OPTIONAL
  if (data.imageAlt) {
    formData.append("imageAlt", data.imageAlt);
  }

  if (data.link) {
    formData.append("link", data.link);
  }

  // BOOLEAN
  formData.append("isActive", data.isActive ? "true" : "false");

  // NUMBER
  formData.append("displayOrder", String(data.displayOrder || 0));

  // 🔥 IMPORTANT
  // Backend expects "image"
  if (data.image) {
    formData.append("image", data.image);
  }

  return api.post(ENDPOINTS.CREATE_BANNER, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ======================
// UPDATE BANNER
// ======================

export const updateBannerService = async (id, data) => {
  const formData = new FormData();

  if (data.title) {
    formData.append("title", data.title);
  }

  if (data.imageAlt) {
    formData.append("imageAlt", data.imageAlt);
  }

  if (data.link) {
    formData.append("link", data.link);
  }

  formData.append("isActive", data.isActive ? "true" : "false");

  formData.append("displayOrder", String(data.displayOrder || 0));

  // 🔥 IMPORTANT
  if (data.image) {
    formData.append("image", data.image);
  }

  return api.patch(ENDPOINTS.UPDATE_BANNER(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ======================
// DELETE BANNER
// ======================

export const deleteBannerService = (id) =>
  api.delete(ENDPOINTS.DELETE_BANNER(id));
