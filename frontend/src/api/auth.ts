import axios from "axios";
import type { User } from "../context/StoreContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type AuthResponse = {
  user: User;
};

function getUserFromResponse(data: AuthResponse) {
  if (!data.user) {
    throw new Error("Signup server did not return a user.");
  }

  return data.user;
}

export async function signupUser(payload: {
  name: string;
  gmail: string;
  password: string;
}) {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return getUserFromResponse(response.data);
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return getUserFromResponse(response.data);
}

export async function updateProfile(payload: {
  id?: string;
  currentEmail: string;
  name: string;
  phone: string;
  email: string;
}) {
  try {
    const response = await api.put<AuthResponse>("/auth/profile", payload);
    return getUserFromResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not update profile."
      );
    }

    throw error;
  }
}

export async function forgotPassword(email: string) {
  try {
    const response = await api.post<{
      message: string;
      emailSent: boolean;
      debugCode?: string;
    }>("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not request password reset."
      );
    }
    throw error;
  }
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  newPassword: string;
}) {
  try {
    const response = await api.post<{ message: string }>("/auth/reset-password", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not reset password."
      );
    }
    throw error;
  }
}

export async function googleLogin(payload: { credential: string }) {
  const response = await api.post<AuthResponse>("/auth/google", payload);
  return getUserFromResponse(response.data);
}


