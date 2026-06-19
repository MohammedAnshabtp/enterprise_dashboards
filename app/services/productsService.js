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
  append("description", data.description);
  append("shortDescription", data.shortDescription);
  append("brand", data.brand);
  append("finish", data.finish);

  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
  if (data.images?.length > 0) {
    data.images.forEach((img) => formData.append("images", img));
  }

  return api.patch(ENDPOINTS.UPDATE_PRODUCT(id), formData);
};
