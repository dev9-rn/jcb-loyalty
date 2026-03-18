import { AxiosResponse } from "axios";
import { Dispatch } from "react";

interface IAuthContext {
    isAuthenticated: boolean;
    maintenanceMsg: string;
    login: (endpoint: string, loginFormData: FormData) => Promise<AxiosResponse>;
    logout: () => void;
    verify: (endpoint: string, verifyFormData: FormData, useType: string) => Promise<AxiosResponse>;
    fetchisMaintenanceApi: () => Promise<void>;
};

interface IUserContext {
    userDetails: IUserDetails & IMechanicDetails & IRetailerDetails | undefined;
    setUserDetails: Dispatch<SetStateAction<IUserDetails & IMechanicDetails | undefined>>
    localUserDetails: IUserDetails & IMechanicDetails | undefined;
    setLocalUserDetails: Dispatch<SetStateAction<IUserDetails & IMechanicDetails | undefined>>
    fetchUserProfileDetails: () => Promise<void>
};

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
};