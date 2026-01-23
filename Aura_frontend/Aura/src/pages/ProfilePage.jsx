import { useState, useEffect } from "react";
import { userDataStore } from "../utils/userDataStore.js";
import { User, Moon, Briefcase, Activity, Calendar, Clock, MapPin, Battery, Smile, TrendingUp } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [checkIns, setCheckIns] = useState([]);
    const [activeTab, setActiveTab] = useState("overview"); // overview, checkins

    // Derived state for other sections
    const [sleepData, setSleepData] = useState(null);
    const [mobilityData, setMobilityData] = useState(null);
    const [taskData, setTaskData] = useState(null);
    const [genderData, setGenderData] = useState(null);

    useEffect(() => {
        // Load all data from store
        const allData = userDataStore.getAllData();
        setProfile(allData.profile);
        setCheckIns(allData.checkins || []);
        setSleepData(allData.sleep);
        setMobilityData(allData.mobility);
        setTaskData(allData.tasks);

        // Determine gender key
        if (allData.profile?.biologicalSex === 'Female') {
            setGenderData(JSON.parse(localStorage.getItem('aura_female_cycle')));
        } else if (allData.profile?.biologicalSex === 'Male') {
            setGenderData(JSON.parse(localStorage.getItem('aura_male_energy')));
        }
    }, []);

    if (!profile) {
        return (
            <div className="p-8 text-center">
                <div className="bg-gray-100 rounded-2xl p-6">
                    <User size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Profile Not Setup</h3>
                    <p className="text-gray-500 mt-2">Please complete the onboarding wizard on the Home screen.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-28 space-y-8">

            {/* Header Profile Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <img
                        src={`https://ui-avatars.com/api/?name=${"User"}&background=random`}
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">Your Profile</h2>
                        <p className="text-blue-200 flex items-center gap-1.5 text-sm mt-1">
                            <Briefcase size={14} /> {profile.occupationType}
                        </p>
                        <div className="flex gap-2 mt-3">
                            {profile.goals?.map(goal => (
                                <span key={goal} className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-medium backdrop-blur-sm">
                                    {goal}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div>
                        <p className="text-xs text-blue-200">Working Hours</p>
                        <p className="font-semibold flex items-center gap-1.5">
                            <Clock size={14} /> {profile.workingHours?.start} - {profile.workingHours?.end}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-blue-200">Age Range</p>
                        <p className="font-semibold">{profile.ageRange}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "overview" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab("checkins")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "checkins" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Check-in History
                </button>
            </div>

            {/* Content Content - Overview */}
            {activeTab === "overview" && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">

                    {/* Sleep Section */}
                    {sleepData && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                <Moon size={20} />
                                <h3 className="font-bold">Sleep Routine</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 p-3 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Average</p>
                                    <p className="text-xl font-bold text-indigo-700">{sleepData.averageSleepHours}h</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Peak Energy</p>
                                    <p className="font-semibold text-indigo-700">{sleepData.peakAlertTime}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gender Specific Section */}
                    {genderData && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-pink-600">
                                <Activity size={20} />
                                <h3 className="font-bold">
                                    {profile.biologicalSex === 'Female' ? 'Cycle Tracking' : 'Energy Pattern'}
                                </h3>
                            </div>
                            {profile.biologicalSex === 'Female' ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-pink-50 p-3 rounded-xl">
                                        <span className="text-sm text-gray-600">Cycle Length</span>
                                        <span className="font-bold text-pink-700">{genderData.averageCycleLength} days</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-pink-50 p-3 rounded-xl">
                                        <span className="text-sm text-gray-600">Start Date</span>
                                        <span className="font-bold text-pink-700">{genderData.cycleStartDate}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
                                        <span className="text-sm text-gray-600">Stress Level</span>
                                        <span className="font-bold text-blue-700">{genderData.stressLevel}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
                                        <span className="text-sm text-gray-600">Crash Time</span>
                                        <span className="font-bold text-blue-700">{genderData.energyCrashTime}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobility */}
                    {mobilityData && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-green-600">
                                <MapPin size={20} />
                                <h3 className="font-bold">Mobility</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                    {mobilityData.dailyCommuteMinutes}m Commute
                                </span>
                                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                    via {mobilityData.travelMode}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content - Check-in History */}
            {activeTab === "checkins" && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">

                    {checkIns.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No check-ins yet</p>
                            <p className="text-sm">Use the + button to add one!</p>
                        </div>
                    ) : (
                        checkIns.map((log, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                        <Calendar size={14} />
                                        {new Date(log.date).toLocaleString()}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold
                                        ${log.energyLevel >= 4 ? 'bg-green-100 text-green-700' :
                                            log.energyLevel >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        Energy: {log.energyLevel}/5
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2">
                                        <Smile size={16} className="text-yellow-500" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mood</p>
                                            <p className="font-semibold text-gray-700 text-sm">{log.mood}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2">
                                        <Moon size={16} className="text-blue-500" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sleep</p>
                                            <p className="font-semibold text-gray-700 text-sm">{log.sleepQuality}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    );
}
