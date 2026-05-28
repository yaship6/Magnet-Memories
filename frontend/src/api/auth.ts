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
