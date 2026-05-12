export const API_BASE_URL =
  process.env.PUBLIC_API_URL ?? "";

export const ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  PRODUCTS: {
    LIST: "/api/products",
    DETAIL: (id: string) => `/api/products/${id}`,
  },
  CART: {
    GET: "/api/cart",
    ITEMS: "/api/cart/items",
    ITEM: (id: string) => `/api/cart/items/${id}`,
  },
  ORDERS: {
    LIST: "/api/orders",
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: "/api/orders",
  },
} as const;

export const DEFAULT_PAGE_SIZE = 12;

export const MAX_PAGE_SIZE = 100;
