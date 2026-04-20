import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// ✅ Create Product
export const createProductService = (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("image", data.image);

  return api.post(ENDPOINTS.CREATE_PRODUCT, formData);
};

// ✅ Update Product
export const updateProductService = (id, data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("body", data.body);

  if (data.image) {
    formData.append("image", data.image);
  }

  return api.patch(ENDPOINTS.UPDATE_PRODUCT(id), formData);
};

export const getProductsService = (query) => {
  return api.get(ENDPOINTS.GET_PRODUCT, {
    params: query,
  });
};
