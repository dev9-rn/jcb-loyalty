import { Dispatch } from "react";

interface IAuthContext {
    isAuthenticated: boolean;
    login: (loginFormData: FormData) => void;
    logout: () => void;
    verify: (verifyFormData: FormData) => void;
};

interface IUserContext {
    userFirebaseToken: string | null;
    setUserFirebaseToken: Dispatch<SetStateAction<string | null>>
    userDetails: IUserDetails | undefined;
    setUserDetails: Dispatch<SetStateAction<IUserDetails | undefined>>
};