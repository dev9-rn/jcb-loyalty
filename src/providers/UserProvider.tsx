import React, { useEffect, useState } from 'react'
import UserContext from '@/context/UserContext'
import { getProfileEndpoint } from '@/libs/utils'
import axios from 'axios'
import axiosInstance from '@/utils/axiosInstance'
import { useToast } from 'react-native-toast-notifications'
import { storageService } from '@/utils/storageService'
import { STORAGE_KEYS } from '@/libs/constants'
import VersionCheck from 'react-native-version-check-expo'
import { Alert, AppState, Linking, Platform } from 'react-native'
import { isUpdateRequired } from '@/utils/isUpdateRequired'
import { GET_DISTRIBUTOR_PROFILE } from '@/utils/routes'

type Props = {
    children: React.ReactNode
}

const UserProvider = ({ children }: Props) => {

    const [userDetails, setUserDetails] = useState<IUserDetails & IMechanicDetails & IRetailerDetails | undefined>(undefined);
    const [localUserDetails, setLocalUserDetails] = useState<IUserDetails & IMechanicDetails | undefined>(undefined);

    const toast = useToast();

    useEffect(() => {
        // Handler for app state changes
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === "active") {
                // checkForVersionUpdate();
            }
        };

        // Add event listener
        const subscription = AppState.addEventListener("change", handleAppStateChange);

        // Initial check on mount
        // checkForVersionUpdate();

        // Cleanup
        return () => {
            subscription.remove();
        };
    }, []);

    const fetchUserProfileDetails = async () => {

        const profileFormData = new FormData();
        profileFormData.append("distributorId", String(userDetails?.id));

        try {
            const response = await axiosInstance.post(GET_DISTRIBUTOR_PROFILE, profileFormData);

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
    };

    const checkForVersionUpdate = async () => {
        try {
            const latestAvailableVersion = Platform.OS === 'ios' ? await fetch(`https://itunes.apple.com/lookup?id=6686404481&country=IN`)
                .then(r => r.json())
                .then((res) => {
                    return res?.results[0]?.version
                })
                : await VersionCheck.getLatestVersion({
                    provider: 'playStore',
                    packageName: 'com.jcb_seqr_loyality_new',
                    ignoreErrors: true,
                });

            const currentVersion = VersionCheck.getCurrentVersion();

            if (isUpdateRequired(currentVersion, latestAvailableVersion)) {
                Alert.alert(
                    'Update Required',
                    'A new version of the app is available. Please update to continue using the app.',
                    [
                        {
                            text: 'Update Now',
                            onPress: async () => {
                                Linking.openURL(
                                    Platform.OS === 'ios'
                                        ? await VersionCheck.getAppStoreUrl({ appID: '6686404481' })
                                        : await VersionCheck.getPlayStoreUrl({ packageName: 'com.jcb_seqr_loyality_new' })
                                );
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {

        }
    }

    return (
        <UserContext.Provider
            value={{ setUserDetails, userDetails, setLocalUserDetails, localUserDetails, fetchUserProfileDetails }}
        >
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider