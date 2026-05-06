import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user) {
    const accessToken = (session.user as { accessToken?: string }).accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);

export const api = {
  projects: {
    list: (featuredOnly = false) =>
      apiClient.get(`/projects?featured_only=${featuredOnly}`),
    get: (id: string) => apiClient.get(`/projects/${id}`),
  },
  blog: {
    list: () => apiClient.get("/blog"),
    get: (slug: string) => apiClient.get(`/blog/${slug}`),
  },
  contact: {
    submit: (data: { name: string; email: string; subject?: string; message: string }) =>
      apiClient.post("/contact", data),
  },
};
