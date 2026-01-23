// Utility to handle IndexedDB for notifications
// This will be used by both the main app and service worker

const DB_NAME = "aura_db";
const STORE_NAME = "notifications";
const DB_VERSION = 1;

/**
 * Open the database
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

/**
 * Get all notifications
 * @returns {Promise<Array>}
 */
export const getStoredNotifications = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by timestamp descending (newest first)
                const sorted = request.result.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                resolve(sorted);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("DB Error:", error);
        return [];
    }
};

/**
 * Save a notification
 * @param {Object} notification 
 */
export const saveNotification = async (notification) => {
    try {
        const db = await openDB();
        const newNotification = {
            id: Date.now(),
            title: notification.title || "New Notification",
            body: notification.body || "",
            timestamp: new Date().toISOString(),
            read: false,
            data: notification.data || {}
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(newNotification);

            request.onsuccess = () => resolve(newNotification);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("DB Error:", error);
        return null;
    }
};

/**
 * Mark notification as read
 * @param {number} id 
 */
export const markAsRead = async (id) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const data = getRequest.result;
            if (data) {
                data.read = true;
                store.put(data);
            }
        };
    } catch (error) {
        console.error("DB Error:", error);
    }
};

/**
 * Delete a notification
 * @param {number} id 
 */
export const deleteNotification = async (id) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.delete(id);
    } catch (error) {
        console.error("DB Error:", error);
    }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
    } catch (error) {
        console.error("DB Error:", error);
    }
};
