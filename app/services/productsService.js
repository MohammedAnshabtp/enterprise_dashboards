import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

export const getProductsService = (params) =>
  api.get(ENDPOINTS.GET_PRODUCTS, { params });

export const createProductService = (data) => {
  const formData = new FormData();

  const append = (key, val) => {
    if (val !== null && val !== undefined && val !== "") {
      formData.append(key, val);
    }
  };

  append("name", data.name);
  append("price", data.price);
  append("shortDescription", data.shortDescription);
  append("description", data.description);
  append("brand", data.brand);
  append("finish", data.finish);
  append("vendor", data.vendor);
  append("squareFeet", data.squareFeet);
  append("pricePerSqft", data.pricePerSqft);
  append("salePrice", data.salePrice);
  append("purchasePrice", data.purchasePrice);
  append("discountPercent", data.discountPercent);
  append("gst", data.gst);
  append("weight", data.weight);
  append("tileInBox", data.tileInBox);
  append("minOrderQuantity", data.minOrderQuantity);
  append("maxOrderQuantity", data.maxOrderQuantity);
  append("hsnCode", data.hsnCode);
  append("batchNo", data.batchNo);
  append("sku", data.sku);
  append("barcode", data.barcode);
  append("thumbnailAlt", data.thumbnailAlt);
  append("status", data.status ?? "active");
  append("sizeCategory", data.sizeCategory);

  if (data.isFreeDelivery !== undefined) append("isFreeDelivery", data.isFreeDelivery);
  if (data.isFeatured !== undefined) append("isFeatured", data.isFeatured);
  if (data.deliveryFee) append("deliveryFee", data.deliveryFee);

  if (data.dimensionsLength) append("dimensions[length]", data.dimensionsLength);
  if (data.dimensionsWidth) append("dimensions[width]", data.dimensionsWidth);

  if (data.spaceCategories?.length > 0) {
    data.spaceCategories.forEach((id) => formData.append("spaceCategories", id));
  }
  if (data.productStyles?.length > 0) {
    data.productStyles.forEach((id) => formData.append("productStyles", id));
  }
  if (data.tileUsageCategories?.length > 0) {
    data.tileUsageCategories.forEach((id) => formData.append("tileUsageCategories", id));
  }

  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
  if (data.images?.length > 0) {
    data.images.forEach((img) => formData.append("images", img));
  }

  return api.post(ENDPOINTS.CREATE_PRODUCT, formData);
};

export const updateProductService = (id, data) => {
  const formData = new FormData();

  const append = (key, val) => {
    if (val !== null && val !== undefined && val !== "") {
      formData.append(key, val);
    }
  };

  append("name", data.name);
  append("price", data.price);
  append("shortDescription", data.shortDescription);
  append("description", data.description);
  append("brand", data.brand);
  append("finish", data.finish);
  append("vendor", data.vendor);
  append("squareFeet", data.squareFeet);
  append("pricePerSqft", data.pricePerSqft);
  append("salePrice", data.salePrice);
  append("purchasePrice", data.purchasePrice);
  append("discountPercent", data.discountPercent);
  append("gst", data.gst);
  append("weight", data.weight);
  append("tileInBox", data.tileInBox);
  append("minOrderQuantity", data.minOrderQuantity);
  append("maxOrderQuantity", data.maxOrderQuantity);
  append("hsnCode", data.hsnCode);
  append("batchNo", data.batchNo);
  append("sku", data.sku);
  append("barcode", data.barcode);
  append("thumbnailAlt", data.thumbnailAlt);
  append("status", data.status);
  append("sizeCategory", data.sizeCategory);

  if (data.isFreeDelivery !== undefined) append("isFreeDelivery", data.isFreeDelivery);
  if (data.isFeatured !== undefined) append("isFeatured", data.isFeatured);
  if (data.deliveryFee) append("deliveryFee", data.deliveryFee);

  if (data.dimensionsLength) append("dimensions[length]", data.dimensionsLength);
  if (data.dimensionsWidth) append("dimensions[width]", data.dimensionsWidth);

  if (data.spaceCategories?.length > 0) {
    data.spaceCategories.forEach((id) => formData.append("spaceCategories", id));
  }
  if (data.productStyles?.length > 0) {
    data.productStyles.forEach((id) => formData.append("productStyles", id));
  }
  if (data.tileUsageCategories?.length > 0) {
    data.tileUsageCategories.forEach((id) => formData.append("tileUsageCategories", id));
  }

  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
  if (data.images?.length > 0) {
    data.images.forEach((img) => formData.append("images", img));
  }

  return api.patch(ENDPOINTS.UPDATE_PRODUCT(id), formData);
};

export const getProductBySlugService = (slug) =>
  api.get(ENDPOINTS.GET_PRODUCT_BY_SLUG(slug));

export const toggleProductStatusService = (id, status) =>
  api.patch(ENDPOINTS.TOGGLE_PRODUCT_STATUS(id), status ? { status } : {});

export const toggleProductFeatureService = (id) =>
  api.patch(ENDPOINTS.TOGGLE_PRODUCT_FEATURE(id));

export const bulkUploadProductsService = (file, stockOnly = false) => {
  const formData = new FormData();
  formData.append("file", file);
  if (stockOnly) formData.append("stockOnly", "true");
  return api.post(ENDPOINTS.PRODUCT_BULK_UPLOAD, formData);
};

export const getBulkUploadStatusService = (jobId) =>
  api.get(ENDPOINTS.PRODUCT_BULK_UPLOAD_STATUS(jobId));

export const getBulkUploadHistoryService = (params) =>
  api.get(ENDPOINTS.PRODUCT_BULK_UPLOAD_HISTORY, { params });

export const getBulkUploadJobService = (jobId) =>
  api.get(ENDPOINTS.PRODUCT_BULK_UPLOAD_STATUS(jobId));
