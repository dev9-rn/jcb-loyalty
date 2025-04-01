import { AxiosResponse } from "axios";
import { Dispatch } from "react";

interface IAuthContext {
    isAuthenticated: boolean;
    login: (loginFormData: FormData) => Promise<AxiosResponse>;
    logout: () => void;
    verify: (verifyFormData: FormData) => Promise<AxiosResponse>;
};

interface IUserContext {
    userFirebaseToken: string | null;
    setUserFirebaseToken: Dispatch<SetStateAction<string | null>>
    userDetails: IUserDetails | undefined;
    setUserDetails: Dispatch<SetStateAction<IUserDetails | undefined>>
};