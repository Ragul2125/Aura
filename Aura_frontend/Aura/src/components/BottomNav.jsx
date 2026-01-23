import { Home, GamepadDirectional, Bell, User, CalendarCheck2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get active tab from current route
    const getActiveTab = () => {
        const path = location.pathname.split('/')[1];
        return path || 'home';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab());

    const handleNavigation = (tab, route) => {
        setActiveTab(tab);
        navigate(route);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="relative h-full flex items-center justify-between px-6">

                <NavItem
                    icon={<Home size={22} />}
                    label="Home"
                    active={activeTab === "home"}
                    onClick={() => handleNavigation("home", "/home")}
                />

                <NavItem
                    icon={<GamepadDirectional size={22} />}
                    label="Activities"
                    active={activeTab === "activities"}
                    onClick={() => handleNavigation("activities", "/activities")}
                />

                {/* Center Button */}
                <div
                    onClick={() => handleNavigation("add", "/calendar")}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer
            ${activeTab === "add" ? "bg-blue-600" : "bg-[#0f73f7]"}`}
                >
                    <CalendarCheck2 className="text-white" size={28} />
                </div>

                <NavItem
                    icon={<Bell size={22} />}
                    label="Notification"
                    active={activeTab === "notifications"}
                    onClick={() => handleNavigation("notifications", "/notifications")}
                />

                <NavItem
                    icon={<User size={22} />}
                    label="Profile"
                    active={activeTab === "profile"}
                    onClick={() => handleNavigation("profile", "/profile")}
                />

            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center text-xs transition-colors duration-200 cursor-pointer
        ${active ? "text-blue-500" : "text-gray-400"}`}
        >
            {icon}
            <span className="mt-1">{label}</span>
        </button>
    );
}
