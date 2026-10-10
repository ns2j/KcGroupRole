import 'dotenv-flow/config';

export const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret-key-change-this-in-production';

if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'super-secret-key-change-this-in-production')) {
    throw new Error('FATAL ERROR: SESSION_SECRET is missing or using default insecure value in production environment.');
}
export const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE_MS || '86400000', 10);
const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

export const ALLOWED_ORIGINS = [
    ...envOrigins,
    process.env.FLUTTER_CALLBACK_URL || 'com.example.flutterauthapp://callback',
];

export const isAllowedRedirect = (targetUrl: string): boolean => {
    try {
        const url = new URL(targetUrl);
        return ALLOWED_ORIGINS.includes(url.origin) || ALLOWED_ORIGINS.includes(`${url.protocol}//${url.host}`);
    } catch (err) {
        return false;
    }
};