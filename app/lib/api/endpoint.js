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
  ADDRESS: "/api/v1/address/",

  // PRODUCTS
  CREATE_PRODUCT: "/api/v1/product/",
  GET_PRODUCT: "/api/v1/product/",
  UPDATE_PRODUCT: (id) => `/api/v1/product/${id}`,

  // SPACE CATEGORY
  GET_SPACE_CATEGORY: "/api/v1/category/space/",
  CREATE_SPACE_CATEGORY: "/api/v1/category/space/",
  UPDATE_SPACE_CATEGORY: (id) => `/api/v1/category/space/${id}`,
  DELETE_SPACE_CATEGORY: (id) => `/api/v1/category/space/${id}`,

  // SIZE CATEGORY
  GET_SIZE_CATEGORY: "/api/v1/category/size/",
  CREATE_SIZE_CATEGORY: "/api/v1/category/size/",
  UPDATE_SIZE_CATEGORY: (id) => `/api/v1/category/size/${id}`,
  DELETE_SIZE_CATEGORY: (id) => `/api/v1/category/size/${id}`,

  // PRODUCT STYLE (TILE)
  GET_PRODUCT_STYLE: "/api/v1/style/",
  CREATE_PRODUCT_STYLE: "/api/v1/style/",
  UPDATE_PRODUCT_STYLE: (id) => `/api/v1/style/${id}`,
  DELETE_PRODUCT_STYLE: (id) => `/api/v1/style/${id}`,

  // CATALOGUE
  GET_CATALOGUE: "/api/v1/catelogue/",
  CREATE_CATALOGUE: "/api/v1/catelogue/",
  UPDATE_CATALOGUE: (id) => `/api/v1/catelogue/${id}`,
  DELETE_CATALOGUE: (id) => `/api/v1/catelogue/${id}`,

  // WISHLIST
  GET_WISHLIST: "/wishlist",
  TOGGLE_WISHLIST: "/wishlist/toggle",
  REMOVE_WISHLIST: (id) => `/wishlist/${id}`,
  CLEAR_WISHLIST: "/wishlist/clear",

  // TILE USAGE CATEGORY
  GET_USAGE_CATEGORY: "/api/v1/category/usage",
  GET_SINGLE_USAGE_CATEGORY: (id) => `/api/v1/category/usage/${id}`,
  CREATE_USAGE_CATEGORY: "/api/v1/category/usage",
  UPDATE_USAGE_CATEGORY: (id) => `/api/v1/category/usage/${id}`,
  DELETE_USAGE_CATEGORY: (id) => `/api/v1/category/usage/${id}`,

  // COUPONS (USER)
  VALIDATE_COUPON: "/api/v1/coupon/validate",

  // ADMIN COUPONS
  GET_ADMIN_COUPONS: "/api/v1/coupon/admin",
  CREATE_COUPON: "/api/v1/coupon/admin",
  UPDATE_COUPON: (id) => `/api/v1/coupon/admin/${id}`,
  DELETE_COUPON: (id) => `/api/v1/coupon/admin/${id}`,
};
