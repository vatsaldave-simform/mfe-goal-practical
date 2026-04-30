export type CartItemProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: CartItemProduct;
};

export type CartResponse = {
  id: string | null;
  items: CartItem[];
  total: number;
  itemCount: number;
};
