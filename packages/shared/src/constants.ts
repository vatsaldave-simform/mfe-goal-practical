export const API_BASE_URL = "http://localhost:3003";

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
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
