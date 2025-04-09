import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import AuthContext from '@/context/AuthContext'
import { useRouter } from 'expo-router'
import axiosInstance from '@/utils/axiosInstance'
import { USER_LOGIN, USER_LOGOUT, VERIFY_OTP } from '@/utils/routes'
import { storage, storageService, tokenStorage, tokenStorageService } from '@/utils/storageService'
import { STORAGE_KEYS } from '@/libs/constants'
import useUser from '@/hooks/useUser'
import { useToast } from 'react-native-toast-notifications'
import { useColorScheme } from '@/hooks/useColorScheme'
import axios from 'axios'

type Props = {
    children: React.ReactNode
}

const AuthProvider = ({ children }: Props) => {

    const { setUserDetails, userFirebaseToken, setLocalUserDetails, localUserDetails, userDetails } = useUser()

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userAuthToken, setUserAuthToken] = useState<string>("");

    const { isDarkColorScheme, setColorScheme, colorScheme } = useColorScheme();

    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        getLocalUser()
    }, []);

    const getLocalUser = () => {
        const localUserDetails = storageService.getItem(STORAGE_KEYS.LOCAL_USER);
        const localAuthToken = tokenStorageService.getAuthToken(STORAGE_KEYS.AUTH_TOKEN);
        const localUserColorScheme = storageService.getItem(STORAGE_KEYS.THEME_COLOR);

        if (!localUserDetails || !localAuthToken) return;

        setLocalUserDetails(JSON.parse(localUserDetails));
        setUserDetails(JSON.parse(localUserDetails))
        setUserAuthToken(localAuthToken);
        setColorScheme(localUserColorScheme as "light" | "dark" | "system");
        setIsAuthenticated(true);
        router.replace("/(root)/(drawer)"); // ✅ Redirect to home tab
    }

    // ✅ Login function (Redirect to OTP Verification)
    const login = async (endpoint: string, formData: FormData, userType: string) => {

        try {
            const response = await axiosInstance.post(endpoint, formData);

            if (response.data.status > 200) {
                return response.data
            };

            router.navigate({
                pathname: "/(auth)/otp-verify",
                params: {
                    userPhone: formData.get("mobileNo"),
                    userType
                }
            });
        } catch (error) {
            return error
        }
    };

    // Veriy user after receiving the OTP (Redirect to HOME / DASHBOARD)
    const verify = async (endpoint: string, verifyFormData: FormData) => {

        try {
            const response = await axiosInstance.post(endpoint, verifyFormData);

            if (response.data.status != 200) {
                return response.data
            };

            setUserAuthToken(response.data?.data?.accesstoken);
            setUserDetails(response.data?.data);

            // Set user details to local storage to maintain the seesion
            storageService.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(response.data?.data));
            storageService.setItem(STORAGE_KEYS.THEME_COLOR, colorScheme);
            tokenStorageService.setAuthToken(STORAGE_KEYS.AUTH_TOKEN, response.data?.data?.accesstoken || response.headers.accesstoken);

            setIsAuthenticated(true);
            router.replace("/(root)/(drawer)"); // ✅ Redirect to home tab
        } catch (error) {
            return error
        }
    };

    // ✅ Logout function (Redirect to Auth Screen)
    const logout = async () => {
        const logoutFormData = new FormData();

        logoutFormData.append("distributorId", userDetails?.id);
        logoutFormData.append("deviceToken", userFirebaseToken);
        logoutFormData.append("userType", userDetails?.userType);

        try {
            const response = await axiosInstance.post(USER_LOGOUT, logoutFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response
                })
            };

            tokenStorage.clearAll();
            storage.clearAll();
            setColorScheme("light");
            toast.show(response.data.message, {
                data: response
            })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
                setColorScheme("light");
            };
        };

        setIsAuthenticated(false);
        router.replace("/(auth)"); // ✅ Redirect to login screen
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, verify }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider