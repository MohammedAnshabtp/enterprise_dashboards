// /services/productStyleService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

export const getProductStyleService = () =>
  api.get(ENDPOINTS.GET_PRODUCT_STYLE);

export const createProductStyleService = (data) =>
  api.post(ENDPOINTS.CREATE_PRODUCT_STYLE, data);

export const updateProductStyleService = (id, data) =>
  api.patch(ENDPOINTS.UPDATE_PRODUCT_STYLE(id), data);

export const deleteProductStyleService = (id) =>
  api.delete(ENDPOINTS.DELETE_PRODUCT_STYLE(id));
