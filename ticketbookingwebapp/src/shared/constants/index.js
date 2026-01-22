// Get API base URL from environment or use default
const getApiBaseUrl = () => {
    // Check for VITE_API_BASE_URL environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Default to relative path (works with Vite proxy in dev, or same origin in prod)
    return '/api';
};

// Get base URL for uploads and static files
const getBaseUrl = () => {
    // Check for VITE_BASE_URL environment variable
    if (import.meta.env.VITE_BASE_URL) {
        return import.meta.env.VITE_BASE_URL;
    }
    // In development, Vite proxy handles /uploads, so use relative path
    // In production, if backend is on same origin, relative path works
    // If backend is on different origin, set VITE_BASE_URL env var
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
export const UPLOADS_BASE_URL = '/uploads';
export const BASE_URL = getBaseUrl();
