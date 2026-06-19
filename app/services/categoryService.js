import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// ─── Space Categories ──────────────────────────────────────────────────────────

export const getSpaceCategoriesService = (params) =>
  api.get(ENDPOINTS.GET_SPACE_CATEGORIES, { params });

export const createSpaceCategoryService = (data) =>
  api.post(ENDPOINTS.CREATE_SPACE_CATEGORY, data);

export const updateSpaceCategoryService = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_SPACE_CATEGORY(id), data);

export const deleteSpaceCategoryService = (id) =>
  api.delete(ENDPOINTS.DELETE_SPACE_CATEGORY(id));

// ─── Tile Usage Categories ─────────────────────────────────────────────────────

export const getTileUsageCategoriesService = (params) =>
  api.get(ENDPOINTS.GET_USAGE_CATEGORY, { params });

export const createTileUsageCategoryService = (data) =>
  api.post(ENDPOINTS.CREATE_USAGE_CATEGORY, data);

export const updateTileUsageCategoryService = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_USAGE_CATEGORY(id), data);

export const deleteTileUsageCategoryService = (id) =>
  api.delete(ENDPOINTS.DELETE_USAGE_CATEGORY(id));
