import { useState, useEffect } from "react";
import { Bell, Trash2, Check } from "lucide-react";
import {
    getStoredNotifications,
    setupNotificationListener,
    markAsRead,
    deleteNotification,
    clearAllNotifications
} from "../utils/notificationUtils";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // Load notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            const stored = await getStoredNotifications();
            setNotifications(stored);
            setLoading(false);
        };

        fetchNotifications();

        // Setup listener for new notifications
        const unsubscribe = setupNotificationListener((newNotification) => {
            // Add new notification to top of list
            setNotifications(prev => [newNotification, ...prev]);
        });

        return () => unsubscribe();
    }, []);

    const refreshList = async () => {
        const stored = await getStoredNotifications();
        setNotifications(stored);
    };

    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
        refreshList();
    };

    const handleDelete = async (id) => {
        await deleteNotification(id);
        refreshList();
    };

    const handleClearAll = async () => {
        if (window.confirm("Are you sure you want to clear all notifications?")) {
            await clearAllNotifications();
            refreshList();
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === "unread") return !notif.read;
        if (filter === "read") return notif.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;
    }

    return (
        <div className="p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="pb-5">
                    <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                    <p className="text-sm text-gray-500">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 pb-8 ">
                {["all", "unread", "read"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === f
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                    {/* <Bell className="mx-auto mb-4 text-gray-300" size={64} /> */}
                    <p className="text-gray-500 text-lg mb-2">No notifications</p>
                    <p className="text-gray-400 text-sm">
                        {filter === "all"
                            ? "You'll see notifications from the backend here"
                            : `No ${filter} notifications`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3 pb-5">
                    {filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all ${notif.read
                                ? "border-blue-400 opacity-75"
                                : "border-blue-500"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800">
                                            {notif.title}
                                        </h3>
                                        {!notif.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {notif.body}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(notif.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {!notif.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={18} className="text-green-600" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notif.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
