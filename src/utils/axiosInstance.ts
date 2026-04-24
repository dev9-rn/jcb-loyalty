import axios from "axios";
import { storage, tokenStorage, tokenStorageService } from "./storageService";
import { STORAGE_KEYS } from "@/libs/constants";
import { router } from "expo-router";
import { Toast } from "react-native-toast-notifications";
import { triggerMaintenanceCheck } from "@/libs/maintenanceHandler";

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const axiosInstance = axios.create({
    baseURL: BASE_URL, // Set your API base URL
    headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        "apikey": 'eIrJLF5;&B:cVh30WDlh1}Ww_BtId@',
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
  async (response) => {

    // Call maintenance check after every API
    if (!response.config.headers?.skipMaintenance) {
      await triggerMaintenanceCheck();
    }

    return response;
  },
    (error) => {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403 && (!error.config?.url?.includes("/login") && !error.config?.url?.includes("/verifyOtp") && !error.config?.url?.includes("/verifyDealer"))) {

                Toast.show(error.response.data.message, {
                    data: error.response
                });
                tokenStorage.clearAll();
                storage.clearAll();
                router.replace("/(auth)")
                // Optionally: Trigger logout or token refresh
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;