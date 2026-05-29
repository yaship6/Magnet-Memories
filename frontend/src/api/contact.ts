import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api",
});

export async function createContactMessage(payload: {
  name: string;
  phone: string;
  requestType: string;
  message: string;
}) {
  try {
    const response = await api.post("/contact-messages", payload);
    return response.data.contactMessage;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Could not submit contact message."
      );
    }

    throw error;
  }
}
