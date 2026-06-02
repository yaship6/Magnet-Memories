import axios from "axios";
import type { CartItem, User } from "../context/StoreContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api",
});
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api";

export type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email?: string;
  customer_gmail?: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
  items: Array<
    CartItem & {
      unitPrice: number;
      lineTotal: number;
      customImages?: string[];
    }
  >;
  total_amount: number;
  status: string;
  payment_method?: "razorpay" | "phonepe" | string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  phonepe_transaction_id?: string | null;
  payment_verified_at?: string | null;
  order_confirmed_at?: string | null;
  confirmation_email_sent?: boolean;
  confirmation_email_message?: string | null;
  confirmation_email_sent_at?: string | null;
};

export type OrderResponse = {
  order: Order;
  emailSent: boolean;
  emailMessage: string;
};

export type RazorpayOrderResponse = {
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
  };
};

export type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type OrdersResponse = {
  orders: Order[];
};

export async function createOrder(payload: {
  customer: User & { phone: string };
  deliveryAddress: string;
  notes: string;
  items: CartItem[];
  payment?: {
    method?: "razorpay" | "phonepe";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    phonepeTransactionId?: string;
  };
}) {
  try {
    const response = await api.post<OrderResponse>("/orders", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not place order."
      );
    }

    throw error;
  }
}

export async function createRazorpayOrder(payload: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  try {
    const response = await api.post<RazorpayOrderResponse>(
      "/payments/razorpay/order",
      payload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not start Razorpay payment."
      );
    }

    throw error;
  }
}

export async function verifyRazorpayPayment(payload: RazorpayPaymentResponse) {
  try {
    const response = await api.post<{
      verified: boolean;
      payment: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
      };
    }>("/payments/razorpay/verify", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not verify payment."
      );
    }

    throw error;
  }
}

export async function getOrders(gmail: string) {
  const response = await api.get<OrdersResponse>("/orders", {
    params: { gmail },
  });

  return response.data.orders;
}

export function getOrdersStreamUrl(gmail: string) {
  const url = new URL(`${apiBaseUrl.replace(/\/$/, "")}/orders/stream`);
  url.searchParams.set("gmail", gmail);
  return url.toString();
}
