import axios from "axios";
import { storage, tokenStorage, tokenStorageService } from "./storageService";
import { STORAGE_KEYS } from "@/libs/constants";
import { router } from "expo-router";

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const axiosInstance = axios.create({
    baseURL: BASE_URL, // Set your API base URL
    headers: {
        "Content-Type": "multipart/form-data",
        "apikey": API_KEY,
    },
    // timeout: 10000, // Optional: Set a timeout for requests
});

// Request Interceptor: Attach Token Automatically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStorageService.getAuthToken(STORAGE_KEYS.AUTH_TOKEN); // Fetch token from MMKV
        if (token) {
            config.headers.accesstoken = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (Optional: Handle Errors Globally)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && !error.config?.url?.includes("/lƒogin")) {
            tokenStorage.clearAll();
            storage.clearAll();
            router.replace("/(auth)")
            // Optionally: Trigger logout or token refresh
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;