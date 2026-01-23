import { useState, useEffect } from "react";
import { userDataStore } from "../utils/userDataStore.js";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar, CheckCircle, Circle, Sun, Moon, Zap, User } from "lucide-react";

export default function HomePage() {
    const [profile, setProfile] = useState(null);
    const [checkIns, setCheckIns] = useState([]);
    const [greeting, setGreeting] = useState("Hello");
    const [chartData, setChartData] = useState([]);

    // Sample tasks - in real app, these would come from TaskPreference schema
    const [tasks, setTasks] = useState([
        { id: 1, text: "Morning Meditation", completed: false, time: "8:00 AM" },
        { id: 2, text: "Hydrate (2L)", completed: false, time: "All Day" },
        { id: 3, text: "Deep Work Session", completed: false, time: "10:00 AM" },
        { id: 4, text: "Read for 15 mins", completed: false, time: "9:00 PM" },
    ]);

    useEffect(() => {
        // Load data
        const data = userDataStore.getAllData();
        setProfile(data.profile);
        setCheckIns(data.checkins || []);

        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // Prepare Chart Data (Tasks Completed per Day - Mock)
        // In a real app, you'd aggregate this from a Tasks schema history
        const mockTaskHistory = [
            { name: 'Mon', tasks: 3, total: 5 },
            { name: 'Tue', tasks: 5, total: 6 },
            { name: 'Wed', tasks: 4, total: 5 },
            { name: 'Thu', tasks: 6, total: 8 },
            { name: 'Fri', tasks: 4, total: 6 },
            { name: 'Sat', tasks: 2, total: 4 },
            { name: 'Sun', tasks: 3, total: 5 },
        ];

        setChartData(mockTaskHistory);
    }, []);

    const toggleTask = (id) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const completionRate = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    return (
        <div className="p-4 pb-24 space-y-6">

            {/* Greeting Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {greeting}, {profile?.ageRange ? "User" : "There"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {/* <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={20} />
                </div> */}
            </div>

            {/* Weekly Insights Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <CheckCircle size={18} />
                        </div>
                        <h3 className="font-bold text-gray-800">Tasks Completed</h3>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        Avg: 4.2 / day
                    </span>
                </div>

                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                dataKey="tasks"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <Calendar size={18} />
                        </div>
                        <h3 className="font-bold text-gray-800">Today's Focus</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                        {completionRate}% Done
                    </span>
                </div>

                <div className="space-y-3">
                    {tasks.map(task => (
                        <button
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group
                                ${task.completed
                                    ? 'bg-gray-50 border-gray-100'
                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                    ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                    {task.completed && <CheckCircle size={12} className="text-white" />}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-semibold transition-all
                                        ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {task.text}
                                    </p>
                                    <p className="text-xs text-gray-400">{task.time}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-3xl">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                        <Sun size={18} />
                        <span className="font-bold text-sm">Morning</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">High</p>
                    <p className="text-xs text-gray-500">Predicted Energy</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-3xl">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <Moon size={18} />
                        <span className="font-bold text-sm">Sleep</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">7.5h</p>
                    <p className="text-xs text-gray-500">Last Night</p>
                </div>
            </div>

        </div>
    );
}
