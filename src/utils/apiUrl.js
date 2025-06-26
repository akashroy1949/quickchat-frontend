/**
 * Utility functions for handling API URLs
 */

// Base API URLs
const DEV_BASE_URL = "http://localhost:5000";
const PROD_BASE_URL = "https://quickchat.dpdns.org";

/**
 * Get the base URL for the API based on the current environment
 * @returns {string} The base URL for the API
 */
export const getBaseUrl = () => {
    return window.location.hostname === "localhost" ? DEV_BASE_URL : PROD_BASE_URL;
};

/**
 * Get the full URL for an API endpoint
 * @param {string} path - The path to append to the base URL
 * @returns {string} The full URL
 */
export const getApiUrl = (path) => {
    return `${getBaseUrl()}/api${path}`;
};

/**
 * Get the full URL for a resource (like an image or file)
 * @param {string} path - The resource path (should start with /)
 * @returns {string} The full URL to the resource
 */
export const getResourceUrl = (path) => {
    if (!path) return null;

    // Make sure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getBaseUrl()}${normalizedPath}`;
};

export default {
    getBaseUrl,
    getApiUrl,
    getResourceUrl
};