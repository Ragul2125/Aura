import { useState, useEffect } from "react";
import { UserProfileService, TaskService } from "../services/api.js";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar, CheckCircle, Circle, Sun, Moon, Zap, User } from "lucide-react";

export default function HomePage() {
    const [profile, setProfile] = useState(null);
    const [checkIns, setCheckIns] = useState([]);
    const [greeting, setGreeting] = useState("Hello");
    const [chartData, setChartData] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [latestCheckIn, setLatestCheckIn] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch profile
                const response = await UserProfileService.getProfile();
                if (response.success) {
                    setProfile(response.data.profile);
                }

                // Fetch check-ins
                const checkinsResponse = await UserProfileService.getDailyCheckIns();
                if (checkinsResponse.success) {
                    setCheckIns(checkinsResponse.data);
                    // Get latest check-in for energy/sleep stats
                    if (checkinsResponse.data.length > 0) {
                        setLatestCheckIn(checkinsResponse.data[0]);
                    }
                }

                // Fetch today's tasks
                const today = new Date().toISOString().split('T')[0];
                const tasksResponse = await TaskService.getTasksByDate(today);
                if (tasksResponse.success) {
                    const formattedTasks = tasksResponse.data.map(task => ({
                        id: task._id,
                        text: task.task,
                        completed: task.completed,
                        time: task.time
                    }));
                    setTasks(formattedTasks);
                }

                // Fetch task statistics for chart
                const statsResponse = await TaskService.getTaskStatistics();
                if (statsResponse.success) {
                    setChartData(statsResponse.data);
                }
            } catch (error) {
                console.error("Failed to load home data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const toggleTask = async (id) => {
        try {
            // Optimistically update UI
            const updatedTasks = tasks.map(t =>
                t.id === id ? { ...t, completed: !t.completed } : t
            );
            setTasks(updatedTasks);

            // Update in backend
            const task = tasks.find(t => t.id === id);
            await TaskService.updateTaskStatus(id, !task.completed);
        } catch (error) {
            console.error("Failed to update task:", error);
            // Revert on error
            const revertedTasks = tasks.map(t =>
                t.id === id ? { ...t, completed: !t.completed } : t
            );
            setTasks(revertedTasks);
        }
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
                        <Zap size={18} />
                        <span className="font-bold text-sm">Energy</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {latestCheckIn ? `${latestCheckIn.energyLevel}/5` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Latest Check-in</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-3xl">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <Moon size={18} />
                        <span className="font-bold text-sm">Sleep</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {latestCheckIn ? latestCheckIn.sleepQuality : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Last Night</p>
                </div>
            </div>

        </div>
    );
}
