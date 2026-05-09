import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// ================= SIZE =================

export const getSizeCategoriesService = () =>
  api.get(ENDPOINTS.GET_SIZE_CATEGORIES);

// ================= SPACE =================

export const getSpaceCategoriesService = (params) =>
  api.get(ENDPOINTS.GET_SPACE_CATEGORIES, { params });

// ================= TILE USAGE =================

export const getTileUsageCategoriesService = () =>
  api.get(ENDPOINTS.GET_TILE_USAGE_CATEGORIES);

// ================= DELETE =================

export const deleteSpaceCategoryService = (id) => {
  return api.delete(ENDPOINTS.DELETE_SPACE_CATEGORY(id));
};

export const createSpaceCategoryService = (data) =>
  api.post(ENDPOINTS.CREATE_SPACE_CATEGORY, data);

export const updateSpaceCategoryService = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_SPACE_CATEGORY(id), data);
