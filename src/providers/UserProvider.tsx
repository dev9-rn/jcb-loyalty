import { Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import UserContext from '@/context/UserContext'
import { messaging } from '../../firebaseConfig'
import { getProfileEndpoint } from '@/libs/utils'
import axios from 'axios'
import axiosInstance from '@/utils/axiosInstance'
import { useToast } from 'react-native-toast-notifications'
import { storageService } from '@/utils/storageService'
import { STORAGE_KEYS } from '@/libs/constants'

type Props = {
    children: React.ReactNode
}

const UserProvider = ({ children }: Props) => {

    const [userFirebaseToken, setUserFirebaseToken] = useState<string | null>("");
    const [userDetails, setUserDetails] = useState<IUserDetails & IMechanicDetails | undefined>(undefined);
    const [localUserDetails, setLocalUserDetails] = useState<IUserDetails & IMechanicDetails | undefined>(undefined);

    const toast = useToast();

    useEffect(() => {
        fetchUserFcmToken();
    }, []);

    const fetchUserFcmToken = async () => {
        try {
            // const apnToken = await messaging().getAPNSToken();
            const fcmToken = await messaging.getToken();
            (fcmToken, "FCM_TOKEN");

            setUserFirebaseToken(fcmToken)
        } catch (error) {
            throw new Error("Something went wrong with firebase " + error);
        }
    };

    const fetchUserProfileDetails = async () => {

        const profileFormData = new FormData();
        profileFormData.append(getProfileEndpoint(userDetails).user_id, userDetails?.id);

        try {
            const response = await axiosInstance.post(getProfileEndpoint(userDetails).endpoint, profileFormData);

            if (response.data.status != 200) {
                (response.data.message)
            };

            const combinedUserDetails = { ...localUserDetails, ...response.data.data }

            // Set user details to local storage to maintain the NEXT seesion
            storageService.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(combinedUserDetails));
            setUserDetails(combinedUserDetails);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
                return;
            }
        }
    }

    return (
        <UserContext.Provider value={{ userFirebaseToken, setUserFirebaseToken, setUserDetails, userDetails, setLocalUserDetails, localUserDetails, fetchUserProfileDetails }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider