// services/authService.js

import api from "../lib/api/axios";
import { ENDPOINTS } from "../lib/api/endpoint";

export const login = (data) => api.post(ENDPOINTS.LOGIN, data);
export const signup = (data) => api.post(ENDPOINTS.SIGNUP, data);
export const sendOtp = (email) => api.post(ENDPOINTS.SEND_EMAIL_OTP, { email });
export const verifyOtp = (data) => api.post(ENDPOINTS.VERIFY_EMAIL_OTP, data);
