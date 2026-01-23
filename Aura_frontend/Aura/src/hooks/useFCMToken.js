import { useState, useEffect } from 'react';
import requestPermission, { getStoredToken, hasNotificationPermission } from '../utils/requestPermission.js';

/**
 * Custom hook for automatic FCM token management
 * Automatically requests permission and generates token on mount
 * Stores and retrieves token from localStorage
 * 
 * @returns {Object} { token, loading, error, refreshToken }
 */
export const useFCMToken = () => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initializeToken = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if token already exists in localStorage
            const storedToken = getStoredToken();

            if (storedToken) {
                console.log("📦 Using stored FCM token");
                setToken(storedToken);
                setLoading(false);
                return;
            }

            // Check if permission is already granted
            if (hasNotificationPermission()) {
                console.log("🔔 Permission already granted, generating token...");
                const newToken = await requestPermission();
                setToken(newToken);
            } else {
                // Request permission automatically
                console.log("🔔 Requesting notification permission...");
                const newToken = await requestPermission();
                setToken(newToken);
            }
        } catch (err) {
            console.error("Error initializing FCM token:", err);
            setError(err.message || "Failed to initialize FCM token");
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const newToken = await requestPermission();
            setToken(newToken);
        } catch (err) {
            setError(err.message || "Failed to refresh token");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeToken();
    }, []);

    return {
        token,
        loading,
        error,
        refreshToken
    };
};

export default useFCMToken;
