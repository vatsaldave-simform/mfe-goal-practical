export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
};

export type OrderDetail = {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};
