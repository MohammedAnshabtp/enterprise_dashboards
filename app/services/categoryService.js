import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

// SIZE
export const getSizeCategoriesService = () =>
  api.get(ENDPOINTS.GET_SIZE_CATEGORIES);

// SPACE
export const getSpaceCategoriesService = () =>
  api.get(ENDPOINTS.GET_SPACE_CATEGORIES);

// TILE USAGE
export const getTileUsageCategoriesService = () =>
  api.get(ENDPOINTS.GET_TILE_USAGE_CATEGORIES);
