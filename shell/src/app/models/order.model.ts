export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];

  customer: {
    fullName: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  paymentMethod: string;

  subtotal: number;
  shipping: number;
  total: number;
}