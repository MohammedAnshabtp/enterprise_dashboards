import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// ================= BULK PRODUCT UPLOAD =================

export const bulkUploadProductsService = (file, stockOnly = false) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append("stockOnly", stockOnly);

  return api.post(ENDPOINTS.PRODUCT_BULK_UPLOAD, formData);
};

// ================= BULK UPLOAD HISTORY =================

export const getBulkUploadHistoryService = () =>
  api.get(ENDPOINTS.PRODUCT_BULK_UPLOAD_HISTORY);

// ================= BULK UPLOAD STATUS =================

export const getBulkUploadStatusService = (jobId) =>
  api.get(ENDPOINTS.PRODUCT_BULK_UPLOAD_STATUS(jobId));

// ================= BULK DELETE =================

export const bulkDeleteProductsService = (productIds) =>
  api.post(ENDPOINTS.PRODUCT_BULK_DELETE, {
    productIds,
  });

// ================= BULK DELETE STATUS =================

export const getBulkDeleteStatusService = (jobId) =>
  api.get(ENDPOINTS.PRODUCT_BULK_DELETE_STATUS(jobId));

// ================= BULK CATEGORY UPDATE =================

// services/productBulkService.js

export const bulkCategoryUpdateService = (payload) =>
  api.patch(ENDPOINTS.PRODUCT_BULK_CATEGORIES, payload);
