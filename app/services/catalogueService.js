// /services/catalogueService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// GET
export const getCatalogueService = (params) => api.get(ENDPOINTS.GET_CATALOGUE, { params });

// CREATE ✅ FIXED
export const createCatalogueService = (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description || "");

  if (data.file) {
    formData.append("file", data.file);
  }

  return api.post(ENDPOINTS.CREATE_CATALOGUE, formData);
};

// UPDATE ✅ FIXED
export const updateCatalogueService = (id, data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description || "");

  // 🔥 OPTIONAL on update
  if (data.file) {
    formData.append("file", data.file);
  }

  return api.put(ENDPOINTS.UPDATE_CATALOGUE(id), formData);
};

// DELETE
export const deleteCatalogueService = (id) =>
  api.delete(ENDPOINTS.DELETE_CATALOGUE(id));
