import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api",
});

export type PexelsPhoto = {
  id: string;
  title: string;
  description: string;
  image: string;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
};

type PexelsPhotosResponse = {
  items: PexelsPhoto[];
  page: number | null;
  nextPage: string | null;
};

export async function getPexelsPhotos(
  query = "personalized gifts happy memories",
  pageSize = 40
) {
  const response = await api.get<PexelsPhotosResponse>("/pexels/photos", {
    params: { query, pageSize },
  });

  return response.data.items;
}
