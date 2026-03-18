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

export const getRelativeTime = (date: string | number | Date | null | undefined): string => {
  if (!date) return '—';

  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );

  const intervals: { label: string; seconds: number }[] = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (let i = 0; i < intervals.length; i++) {
    const count = Math.floor(seconds / intervals[i].seconds);

    if (count >= 1) {
      return `${count} ${intervals[i].label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

// Format date as DD-MM-YYYY for API
export const formatDateForAPI = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};