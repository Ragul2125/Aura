import { useRef, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useFCMToken } from "../hooks/useFCMToken.js";
import { LogOut, PlusCircle, RefreshCw } from "lucide-react";

// Forms
import OnboardingWizard from "../components/forms/OnboardingWizard.jsx";
import DailyCheckInModal from "../components/forms/DailyCheckInModal.jsx";
import { userDataStore } from "../utils/userDataStore.js";

export default function Home() {
    // FCM token generation runs silently in the background
    useFCMToken();

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);

    // Check for onboarding status on mount
    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = () => {
        const isComplete = userDataStore.isOnboardingComplete();
        if (!isComplete) {
            setTimeout(() => setShowOnboarding(true), 1000);
        }
    };

    const handleReset = () => {
        if (confirm("Reset all data and restart onboarding?")) {
            localStorage.clear(); // Clear all data
            window.location.reload(); // Reload to trigger onboarding
        }
    };

    return (
        <div className="w-full min-h-screen app-gradient ">
            {/* Header */}
            {/* <div className="p-2">
                <div className="flex justify-between items-center w-full p-2">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://i.pravatar.cc/150"
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                            alt="profile"
                        />
                        <div>
                            <p className="text-sm text-gray-600">Welcome Back</p>
                            <h2 className="text-lg font-bold text-gray-800">
                                Thanush <span className="ml-1">👋</span>
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors text-gray-600"
                        title="Reset Demo"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div> */}

            {/* Quick Action Button for Demo */}
            <div className="fixed bottom-24 right-4 z-40">
                <button
                    onClick={() => setShowDailyCheckIn(true)}
                    className="bg-white p-3 rounded-full shadow-lg text-blue-600 hover:scale-110 transition-transform"
                    title="Daily Check-in"
                >
                    <PlusCircle size={24} />
                </button>
            </div>

            {/* Page Content - Rendered by child routes */}
            <div className="pb-24">
                <Outlet />
            </div>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Modals */}
            {showOnboarding && (
                <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
            )}

            <DailyCheckInModal
                isOpen={showDailyCheckIn}
                onClose={() => setShowDailyCheckIn(false)}
            />
        </div>
    );
}
