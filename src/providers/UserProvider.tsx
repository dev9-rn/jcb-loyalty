import { Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import UserContext from '@/context/UserContext'
import { messaging } from '../../firebaseConfig'

type Props = {
    children: React.ReactNode
}

const UserProvider = ({ children }: Props) => {

    const [userFirebaseToken, setUserFirebaseToken] = useState<string | null>("");
    const [userDetails, setUserDetails] = useState<IUserDetails & IMechanicDetails | undefined>(undefined);

    useEffect(() => {
        fetchUserFcmToken();
    }, []);

    const fetchUserFcmToken = async () => {
        try {
            // const apnToken = await messaging().getAPNSToken();
            const fcmToken = await messaging.getToken();
            console.log(fcmToken, "FCM_TOKEN");

            setUserFirebaseToken(fcmToken)
        } catch (error) {
            throw new Error("Something went wrong with firebase " + error);
        }
    };

    return (
        <UserContext.Provider value={{ userFirebaseToken, setUserFirebaseToken, setUserDetails, userDetails }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider