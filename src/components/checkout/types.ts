// Shapes returned by /api/checkout (salemtamilroots_web_backend CheckoutController).

export type ServerCartItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  slug?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
  welcomeGift: boolean;
  weight?: number | null;
  unit?: string | null;
};

export type ServerCart = {
  items: ServerCartItem[];
  summary: { subTotal: number; discount: number; shipping: number; total: number; freeShippingFrom?: number } | null;
  problems: { productId: number; message: string }[];
};

export type Address = {
  addressId: number;
  name: string;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
};

export type Placed = {
  orderId: number;
  orderNumber: string;
  total: number;
  state: "confirmed" | "payment";
  paymentSessionId?: string;
  cashfreeMode?: string;
};

export type OrderState = {
  orderId: number;
  orderNumber: string;
  total: number;
  paymentMethod: "COD" | "ONLINE";
  state: "confirmed" | "pending" | "failed";
  details?: {
    subtotal?: number;
    orderdiscount?: number | null;
    transportcharge?: number | null;
    coupondiscount?: number | null;
    finalamount?: number;
    items?: { productId: number; productName: string; quantity: number; lineTotal: number; imageUrl?: string; weightValue?: number | null; unitType?: string | null }[];
  } | null;
};
