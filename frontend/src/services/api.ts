import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (newToken: string) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = typeof window !== 'undefined' ? Cookies.get('refresh_token') : null;
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post(`${API_BASE_URL}/user/refresh`, { refresh_token: refreshToken });
      const { token: newToken, refresh_token: newRefreshToken } = res.data;

      Cookies.set('token', newToken, { expires: 1 });
      if (newRefreshToken) Cookies.set('refresh_token', newRefreshToken, { expires: 7 });

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      original.headers.Authorization = `Bearer ${newToken}`;

      processQueue(newToken);
      return api(original);
    } catch {
      Cookies.remove('token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
