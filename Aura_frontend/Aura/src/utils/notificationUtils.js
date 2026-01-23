import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";
import {
    getStoredNotifications as getFromDB,
    saveNotification as saveToDB,
    markAsRead as markReadDB,
    deleteNotification as deleteDB,
    clearAllNotifications as clearDB
} from "./db";

// Re-export DB functions wrapper
export const getStoredNotifications = getFromDB;
export const saveNotification = saveToDB;
export const markAsRead = markReadDB;
export const deleteNotification = deleteDB;
export const clearAllNotifications = clearDB;

/**
 * Setup foreground message listener
 * @param {Function} callback - Callback function to handle new notifications
 * @returns {Function} Unsubscribe function
 */
export const setupNotificationListener = (callback) => {
    try {
        const unsubscribe = onMessage(messaging, async (payload) => {
            console.log("🔔 Foreground notification received:", payload);

            const notification = {
                title: payload.notification?.title || payload.data?.title,
                body: payload.notification?.body || payload.data?.body,
                data: payload.data || {}
            };

            // Save to IndexedDB
            const saved = await saveToDB(notification);

            // Show browser notification
            if (Notification.permission === "granted") {
                new Notification(notification.title, {
                    body: notification.body,
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/icon-192x192.png"
                });
            }

            // Trigger callback
            if (callback && saved) {
                callback(saved);
            }
        });

        // Listen for BroadcastChannel messages from Service Worker
        const channel = new BroadcastChannel('aura_notifications');
        channel.onmessage = (event) => {
            console.log("📨 Received Broadcast message:", event.data);
            if (callback) {
                callback(event.data);
            }
        };

        console.log("✅ Notification listener setup complete");

        return () => {
            unsubscribe();
            channel.close();
        };
    } catch (error) {
        console.error("Error setting up notification listener:", error);
        return () => { };
    }
};
