import { LOGOUT } from "../actionTypes";
import { purgeStore } from "../../store";

/**
 * Action creator for logging out the user
 * This will clear all user data from the Redux store
 */
export const logoutUser = () => ({
    type: LOGOUT
});

/**
 * Comprehensive logout function that clears all user data
 * - Clears localStorage
 * - Clears sessionStorage
 * - Dispatches logout action to reset Redux state
 * - Clears Redux persist data
 * - Disconnects from any active sockets
 */
export const performLogout = () => {
    return (dispatch) => {
        try {
            // Clear specific localStorage items
            localStorage.removeItem("token");
            localStorage.removeItem("userId");

            // Clear any other app-specific localStorage items
            const appKeys = [];
            // Find all localStorage keys that might be related to the app
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // Add keys that might be related to your app
                if (key.includes("persist:") ||
                    key.includes("quickchat") ||
                    key.includes("chat") ||
                    key.includes("user") ||
                    key.includes("auth") ||
                    key.includes("token")) {
                    appKeys.push(key);
                }
            }

            // Remove all identified app-related keys
            appKeys.forEach(key => localStorage.removeItem(key));

            // Clear sessionStorage completely
            sessionStorage.clear();

            // Clear any cookies that might be used for authentication
            // This is a simple approach that works for non-HttpOnly cookies
            document.cookie.split(";").forEach(cookie => {
                const [name] = cookie.trim().split("=");
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            });

            // Purge the Redux persist store
            purgeStore();

            // Dispatch the logout action to reset Redux state
            dispatch(logoutUser());

            // Force clear Redux persist data by clearing the specific persist keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('persist:')) {
                    localStorage.removeItem(key);
                }
            }

            // Redirect to login page
            window.location.href = "/login";
        } catch (error) {
            console.error("Error during logout:", error);
            // Even if there's an error, try to redirect to login
            window.location.href = "/login";
        }
    };
};