// services/usageCategoryService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

export const getUsageCategories = (params) =>
  api.get(ENDPOINTS.GET_USAGE_CATEGORY, { params });

export const createUsageCategory = (data) =>
  api.post(ENDPOINTS.CREATE_USAGE_CATEGORY, data);

export const updateUsageCategory = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_USAGE_CATEGORY(id), data);

export const deleteUsageCategory = (id) =>
  api.delete(ENDPOINTS.DELETE_USAGE_CATEGORY(id));
