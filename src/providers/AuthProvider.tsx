import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import AuthContext from '@/context/AuthContext'
import { useRouter } from 'expo-router'
import axiosInstance from '@/utils/axiosInstance'
import { USER_LOGIN, USER_LOGOUT, VERIFY_OTP } from '@/utils/routes'
import { storageService, tokenStorageService } from '@/utils/storageService'
import { STORAGE_KEYS } from '@/libs/constants'
import useUser from '@/hooks/useUser'

type Props = {
    children: React.ReactNode
}

const AuthProvider = ({ children }: Props) => {

    const { setUserDetails, userDetails, userFirebaseToken } = useUser()

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userAuthToken, setUserAuthToken] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        getLocalUser()
    }, []);

    const getLocalUser = () => {
        const localUserDetails = storageService.getItem(STORAGE_KEYS.LOCAL_USER);
        const localAuthToken = tokenStorageService.getAuthToken(STORAGE_KEYS.AUTH_TOKEN);

        if (!localUserDetails || !localAuthToken) return;

        setUserDetails(JSON.parse(localUserDetails));
        setUserAuthToken(localAuthToken);
        setIsAuthenticated(true);
        router.replace("/(drawer)"); // ✅ Redirect to home tab
    }

    // ✅ Login function (Redirect to OTP Verification)
    const login = async (formData: FormData) => {

        try {
            const response = await axiosInstance.post(USER_LOGIN, formData);

            console.log(response.data, "LOGIN_RES");

            if (!response.data?.success || response.data.status > 200) {
                console.log(response.data?.message, "SVR_ERR");
            };

            router.navigate({
                pathname: "/(auth)/otp-verify",
                params: {
                    userPhone: formData.get("mobileNo")
                }
            });
        } catch (error) {
            console.log(error, "SOMETHIGN_WENT_WRONG_LOGIN");
        }
    };

    // Veriy user after receiving the OTP (Redirect to HOME / DASHBOARD)
    const verify = async (verifyFormData: FormData) => {

        try {
            const response = await axiosInstance.post(VERIFY_OTP, verifyFormData);

            if (response.data.message != "success") {
                console.log(response.data.message);
            };

            setUserAuthToken(response.data?.data?.accesstoken);
            setUserDetails(response.data?.data);

            // Set user details to local storage to maintain the seesion
            storageService.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(response.data?.data));
            tokenStorageService.setAuthToken(STORAGE_KEYS.AUTH_TOKEN, response.data?.data?.accesstoken);

            setIsAuthenticated(true);
            router.replace("/(drawer)"); // ✅ Redirect to home tab
        } catch (error) {
            console.log(error, "ERROR_VERIFY");
        }
    }

    // ✅ Logout function (Redirect to Auth Screen)
    const logout = async () => {
        const logoutFormData = new FormData();

        logoutFormData.append("distributorId", userDetails?.id);
        logoutFormData.append("deviceToken", userFirebaseToken);

        try {
            const response = await axiosInstance.post(USER_LOGOUT, logoutFormData);

            console.log(response.data)
        } catch (error) {
            console.log(error, "LOGOUT_ERROR");
        }

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