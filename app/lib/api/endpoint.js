export const ENDPOINTS = {
  // AUTH
  SIGNUP: "/api/v1/auth/signup",
  LOGIN: "/api/auth/v1/login",
  LOGOUT: "/api/auth/v1/logout",
  REFRESH_TOKEN: "/api/auth/v1/refresh-token",

  GET_PROFILE: "/api/v1/auth/user/profile",
  UPDATE_PROFILE: "/api/v1/auth/user/profile/update",

  // OTP
  SEND_EMAIL_OTP: "/api/auth/v1/signup/email/get-otp",
  VERIFY_EMAIL_OTP: "/api/auth/v1/verify/email/otp",

  // PASSWORD
  FORGET_PASSWORD: "/api/auth/v1/forget-password",
  UPDATE_PASSWORD: "/api/auth/v1/update-password",

  // AVATAR
  UPLOAD_AVATAR: "/api/v1/auth/user/avatar",
  DELETE_AVATAR: "/api/v1/auth/user/avatar",

  // ADDRESS
  ADDRESS: "/api/address/v1/",

  // PRODUCTS
  CREATE_PRODUCT: "/api/v1/product/",
  GET_PRODUCT: "/api/v1/product/",
  UPDATE_PRODUCT: (id) => `/api/v1/product/${id}`,
};
