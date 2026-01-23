importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBCsZQ_8lgjZ3dL_LwcfqaEQBD2NkaYO5Y",
    projectId: "aura-89086",
    messagingSenderId: "891061616279",
    appId: "1:891061616279:web:fede228733cc6dddd573d2",
});

const messaging = firebase.messaging();

// IndexedDB Logic (Duplicated here because SW can't import modules)
const DB_NAME = "aura_db";
const STORE_NAME = "notifications";
const DB_VERSION = 1;

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

const saveToDB = async (notification) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(notification);
            request.onsuccess = () => resolve(notification);
            request.onerror = (e) => reject(e);
        });
    } catch (e) {
        console.error("SW DB Error:", e);
    }
};

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("📬 Background notification received:", payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || "",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        data: payload.data || {}
    };

    const newNotification = {
        id: Date.now(),
        title: notificationTitle,
        body: notificationOptions.body,
        timestamp: new Date().toISOString(),
        read: false,
        data: notificationOptions.data
    };

    // 1. Save to IndexedDB (Persistent Storage)
    saveToDB(newNotification).then(() => {
        console.log("💾 Notification saved to DB from SW");

        // 2. Notify Open Windows via BroadcastChannel
        const channel = new BroadcastChannel('aura_notifications');
        channel.postMessage(newNotification);
        channel.close();
    });

    // 3. Show System Notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});
