import { useState, useEffect, useRef } from "react";
import { userDataStore } from "../utils/userDataStore";
import { Calendar as CalendarIcon, CheckCircle, ClipboardList, Battery, Smile, Moon } from "lucide-react";

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState("tasks"); // tasks | checkins
    const [tasks, setTasks] = useState([]);
    const [checkIns, setCheckIns] = useState([]);
    const scrollRef = useRef(null);

    // Generate last 30 days + next 7 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = -30; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const dates = generateDates();

    // Format helpers
    const formatDateKey = (date) => date.toISOString().split('T')[0];
    const isToday = (date) => formatDateKey(date) === formatDateKey(new Date());

    useEffect(() => {
        // Auto-scroll to today on mount
        if (scrollRef.current) {
            const todayIndex = 30; // 30 days back means index 30 is today
            const cardWidth = 56; // w-14
            const gap = 12; // gap-3
            const totalItemWidth = cardWidth + gap;

            // Center calculation
            const centerOffset = (window.innerWidth / 2) - (cardWidth / 2);
            scrollRef.current.scrollLeft = (todayIndex * totalItemWidth) - centerOffset + 16; // +16 for padding correction
        }
    }, []);

    useEffect(() => {
        const dateKey = formatDateKey(selectedDate);

        // 1. Load Tasks
        let dailyTasks = userDataStore.getDailyTasks(dateKey);

        // If today and no tasks yet, initialize defaults (mock)
        if (!dailyTasks && isToday(selectedDate)) {
            dailyTasks = [
                { id: 1, text: "Morning Meditation", completed: false, time: "8:00 AM" },
                { id: 2, text: "Hydrate (2L)", completed: false, time: "All Day" },
                { id: 3, text: "Deep Work Session", completed: false, time: "10:00 AM" },
                { id: 4, text: "Read for 15 mins", completed: false, time: "9:00 PM" },
            ];
            // Save initial defaults
            userDataStore.saveDailyTasks(dateKey, dailyTasks);
        }

        setTasks(dailyTasks || []);

        // 2. Load Check-ins (Filter from full list)
        const allCheckIns = userDataStore.getCheckIns();
        const dailyCheckIns = allCheckIns.filter(log => log.date.startsWith(dateKey));
        setCheckIns(dailyCheckIns);

    }, [selectedDate]);

    const handleTaskToggle = (taskId) => {
        // Only allow editing today (or allow past editing? User said "past task data", implies history. Editing past usually okay in MVP)
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);
        userDataStore.saveDailyTasks(formatDateKey(selectedDate), updatedTasks);
    };

    return (
        <div className="p-4 pb-24 space-y-6 flex flex-col h-screen ">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CalendarIcon size={24} className="text-blue-600" />
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Track your daily history and plan ahead</p>
            </div>

            {/* Sticky Calendar Strip - Updated to Circular Design */}
            <div className="-mx-4 px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10 pb-2">
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pt-2 px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {dates.map((date, i) => {
                        const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
                        const isCurrentDay = isToday(date);

                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    setSelectedDate(date);
                                    if (navigator.vibrate) navigator.vibrate(5);
                                }}
                                className="flex-shrink-0 flex flex-col items-center gap-2 w-14 group"
                            >
                                <span className={`text-xs font-medium uppercase tracking-wider transition-colors
                                    ${isSelected ? 'text-blue-600 font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                </span>

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative
                                    ${isSelected
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                        : 'bg-transparent text-gray-700 hover:bg-gray-50 hover:shadow-sm'}`}>
                                    {date.getDate()}

                                    {/* Dot indicator for today if not selected */}
                                    {isCurrentDay && !isSelected && (
                                        <div className="absolute -bottom-1.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Toggle Tabs */}
            <div className="bg-gray-100 p-1 rounded-xl flex shrink-0 mx-1">
                <button
                    onClick={() => setActiveTab("tasks")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
                        ${activeTab === "tasks" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <ClipboardList size={16} /> Tasks
                </button>
                <button
                    onClick={() => setActiveTab("checkins")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
                        ${activeTab === "checkins" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <Battery size={16} /> Check-ins
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pb-20 px-1">

                {activeTab === "tasks" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <ClipboardList size={48} className="opacity-20 mb-3" />
                                <p>No tasks recorded</p>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleTaskToggle(task.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group
                                        ${task.completed
                                            ? 'bg-gray-50/50 border-gray-100 opacity-60'
                                            : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                            ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-200 group-hover:border-blue-400'}`}>
                                            {task.completed && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-medium transition-all
                                                ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {task.text}
                                            </p>
                                            <p className="text-xs text-gray-400">{task.time}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}

                        {/* Summary Footer for Past Days */}
                        {!isToday(selectedDate) && tasks.length > 0 && (
                            <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl text-center text-blue-700 text-sm border border-blue-100">
                                History: {tasks.filter(t => t.completed).length}/{tasks.length} completed
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "checkins" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {checkIns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Battery size={48} className="opacity-20 mb-3" />
                                <p>No check-ins found</p>
                            </div>
                        ) : (
                            checkIns.map((log, index) => (
                                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        </div>
    );
}
