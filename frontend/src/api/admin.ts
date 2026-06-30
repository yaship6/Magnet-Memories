import axios from "axios";
import type { Order } from "./orders";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api"}/admin`,
});

// Interceptor to add authorization key to all admin requests
api.interceptors.request.use((config) => {
  const adminKey = import.meta.env.VITE_ADMIN_SECRET_KEY ?? "admin_secret_super_key_123!";
  config.headers["x-admin-key"] = adminKey;
  return config;
});

export async function getAdminOrders() {
  try {
    const response = await api.get<{ orders: Order[] }>("/orders");
    return response.data.orders;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not load admin orders."
      );
    }
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const response = await api.patch<{ order: Order }>(`/orders/${orderId}/status`, { status });
    return response.data.order;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not update order status."
      );
    }
    throw error;
  }
}

export type Feedback = {
  id: string;
  created_at: string;
  customer_user_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_gmail?: string | null;
  order_id: string;
  rating: number;
  feedback: string;
};

export async function getAdminFeedback() {
  try {
    const response = await api.get<{ feedback: Feedback[] }>("/feedback");
    return response.data.feedback;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not load admin feedback."
      );
    }
    throw error;
  }
}
