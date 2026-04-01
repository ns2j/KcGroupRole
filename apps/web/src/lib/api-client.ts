import type { UserContext, AuthorizationResponse } from '../../../packages/shared/api-types';

export const redirectToLogin = () => {
    const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || '';
    const currentUrl = window.location.href;
    window.location.href = `${BFF_URL}/auth/login?redirect_to=${encodeURIComponent(currentUrl)}`;
};

export const redirectToLogout = () => {
    const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || '';
    const currentUrl = window.location.href;
    window.location.href = `${BFF_URL}/auth/logout?redirect_to=${encodeURIComponent(currentUrl)}`;
};

export const fetchProtectedApi = async (path: string, options: RequestInit = {}) => {
    const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return fetch(`${BASE_PATH}${path}`, {
        ...options,
        credentials: 'include', // Mandatory for sending cookies (session ID)
    });
};

export type AuthCheckResult<T = AuthorizationResponse> = {
    status: 'authorized' | 'forbidden' | 'unauthenticated';
    data?: T;
};

export const verifyAccess = async <T = AuthorizationResponse>(path: string): Promise<AuthCheckResult<T>> => {
    try {
        const response = await fetchProtectedApi(path);

        if (response.ok) {
            const data = await response.json();
            return { status: 'authorized', data };
        }

        // Case of 403 Forbidden (Insufficient permissions)
        if (response.status === 403) {
            return { status: 'forbidden' };
        }

        // Case of 401 Unauthorized or other errors
        return { status: 'unauthenticated' };

    } catch (err) {
        // Treat network errors etc. as unauthenticated
        return { status: 'unauthenticated' };
    }
};
