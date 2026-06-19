import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

export const getAddressService = () => api.get(ENDPOINTS.ADDRESS);

export const createAddressService = (data) => api.post(ENDPOINTS.ADDRESS, data);

export const updateAddressService = (id, data) =>
  api.put(`${ENDPOINTS.ADDRESS}${id}`, data);

export const deleteAddressService = (id) =>
  api.delete(`${ENDPOINTS.ADDRESS}${id}`);

export const getAddressByIdService = (id) =>
  api.get(ENDPOINTS.ADDRESS_BY_ID(id));

export const setDefaultAddressService = (id) =>
  api.patch(ENDPOINTS.ADDRESS_SET_DEFAULT(id));
