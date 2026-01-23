import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase";

const VAPID_KEY = "BIyFc5xDz5YPtgUb3UZKeq3i788fXVyqveWkBKGrcKMzeKWVeKvwC-mCu6Au64IfYL-zgPF-X5VIhV-Ld-N_IPU";
const FCM_TOKEN_KEY = "fcmToken";

/**
 * Request notification permission and generate FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
const requestPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);

        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
            });

            console.log("✅ FCM Token Generated:", token);

            // Store token in localStorage
            if (token) {
                localStorage.setItem(FCM_TOKEN_KEY, token);
                console.log("📦 Token saved to localStorage");
            }

            return token;
        } else {
            console.log("❌ Notification permission denied");
            return null;
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
};

/**
 * Get FCM token from localStorage
 * @returns {string|null} Stored FCM token or null
 */
export const getStoredToken = () => {
    return localStorage.getItem(FCM_TOKEN_KEY);
};

/**
 * Remove FCM token from localStorage
 */
export const clearStoredToken = () => {
    localStorage.removeItem(FCM_TOKEN_KEY);
    console.log("🗑️ Token cleared from localStorage");
};

/**
 * Check if notification permission is granted
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
    return Notification.permission === "granted";
};

export default requestPermission;
