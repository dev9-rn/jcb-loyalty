import { GET_DISTRIBUTOR_PROFILE, GET_MECHANIC_PROFILE, GET_RETAILER_PROFILE } from '@/utils/routes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
};

export function getProfileEndpoint(userDetails: IUserDetails & IMechanicDetails | undefined) {
    if (userDetails?.userType === 0) {
        return {
            endpoint: GET_DISTRIBUTOR_PROFILE,
            user_id: "distributorId"
        };
    };

    if (userDetails?.userType === 1) {
        return {
            endpoint: GET_MECHANIC_PROFILE,
            user_id: "mechanicId"
        };
    };

    return {
        endpoint: GET_RETAILER_PROFILE,
        user_id: "dealerId"
    }
};