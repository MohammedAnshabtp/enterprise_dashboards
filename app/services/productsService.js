import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// GET
export const getProductsService = (params) =>
  api.get(ENDPOINTS.GET_PRODUCTS, {
    params,
  });

// CREATE
export const createProductService = (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("price", data.price);

  if (data.shortDescription) {
    formData.append("shortDescription", data.shortDescription);
  }

  if (data.squareFeet) {
    formData.append("squareFeet", data.squareFeet);
  }

  if (data.pricePerSqft) {
    formData.append("pricePerSqft", data.pricePerSqft);
  }

  if (data.thumbnailAlt) {
    formData.append("thumbnailAlt", data.thumbnailAlt);
  }

  // ✅ thumbnail
  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  // ✅ multiple images
  if (data.images?.length > 0) {
    data.images.forEach((img) => {
      formData.append("images", img);
    });
  }

  return api.post(ENDPOINTS.CREATE_PRODUCT, formData);
};

// UPDATE
export const updateProductService = (id, data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);

  formData.append("price", data.price);

  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  if (data.images?.length > 0) {
    data.images.forEach((img) => {
      formData.append("images", img);
    });
  }

  return api.patch(ENDPOINTS.UPDATE_PRODUCT(id), formData);
};
