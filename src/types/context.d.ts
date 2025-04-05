import { AxiosResponse } from "axios";
import { Dispatch } from "react";

interface IAuthContext {
    isAuthenticated: boolean;
    login: (endpoint: string, loginFormData: FormData, userType: string) => Promise<AxiosResponse>;
    logout: () => void;
    verify: (endpoint: string, verifyFormData: FormData, useType: string) => Promise<AxiosResponse>;
};

interface IUserContext {
    userFirebaseToken: string | null;
    setUserFirebaseToken: Dispatch<SetStateAction<string | null>>
    userDetails: IUserDetails & IMechanicDetails | undefined;
    setUserDetails: Dispatch<SetStateAction<IUserDetails & IMechanicDetails | undefined>>
    localUserDetails: IUserDetails & IMechanicDetails | undefined;
    setLocalUserDetails: Dispatch<SetStateAction<IUserDetails & IMechanicDetails | undefined>>
    fetchUserProfileDetails: () => Promise<void>
};