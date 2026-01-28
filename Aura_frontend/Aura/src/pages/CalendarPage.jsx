import { useState, useEffect, useRef } from "react";
import { UserProfileService, TaskService } from "../services/api.js";
import axios from "axios";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ClipboardList,
  Battery,
  Smile,
  Moon,
  Edit2,
  X,
} from "lucide-react";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("tasks"); // tasks | checkins
  const [tasks, setTasks] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRequest, setEditRequest] = useState("");
  const [editLoading, setEditLoading] = useState(false);
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
  const formatDateKey = (date) => date.toISOString().split("T")[0];
  const isToday = (date) => formatDateKey(date) === formatDateKey(new Date());

  useEffect(() => {
    // Auto-scroll to today on mount
    if (scrollRef.current) {
      const todayIndex = 30; // 30 days back means index 30 is today
      const cardWidth = 56; // w-14
      const gap = 12; // gap-3
      const totalItemWidth = cardWidth + gap;

      // Center calculation
      const centerOffset = window.innerWidth / 2 - cardWidth / 2;
      scrollRef.current.scrollLeft =
        todayIndex * totalItemWidth - centerOffset + 16; // +16 for padding correction
    }
  }, []);

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);

    // 1. Load Tasks
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // First, try to fetch tasks from MongoDB
        const response = await TaskService.getTasksByDate(dateKey);

        if (response.success && response.data.length > 0) {
          // Tasks exist in MongoDB, use them
          const formattedTasks = response.data.map((task) => ({
            id: task._id,
            text: task.task,
            time: task.time,
            priority: task.priority,
            reason: task.reason,
            aiSuggestion: task.aiSuggestion,
            completed: task.completed,
            isAiGenerated: task.isAiGenerated,
          }));
          setTasks(formattedTasks);
        } else if (isToday(selectedDate)) {
          // No tasks in MongoDB and it's today - fetch from AI
          const userId = localStorage.getItem("userId") || "unknown";

          const aiResponse = await axios({
            method: "get",
            url: `https://56d2bc5119c8.ngrok-free.app/plan_tasks?user_id=${userId}`,
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          });

          console.log("AI tasks response:", aiResponse.data);

          // Parse AI tasks
          let aiTasks = [];
          if (aiResponse.data && aiResponse.data.tasks) {
            aiTasks = aiResponse.data.tasks;
          } else if (Array.isArray(aiResponse.data)) {
            aiTasks = aiResponse.data;
          }

          if (aiTasks.length > 0) {
            // Save AI tasks to MongoDB
            await TaskService.saveAITasks(dateKey, aiTasks);

            // Format and display tasks
            const formattedTasks = aiTasks.map((task, index) => ({
              id: task._id || `temp-${index}`,
              text: task.task,
              time: task.time,
              priority: task.priority,
              reason: task.reason,
              aiSuggestion: task.aiSuggestion,
              completed: false,
              isAiGenerated: task.is_AI_generated || task.isAiGenerated,
            }));
            setTasks(formattedTasks);

            // Refresh from MongoDB to get proper IDs
            const refreshResponse = await TaskService.getTasksByDate(dateKey);
            if (refreshResponse.success) {
              const refreshedTasks = refreshResponse.data.map((task) => ({
                id: task._id,
                text: task.task,
                time: task.time,
                priority: task.priority,
                reason: task.reason,
                aiSuggestion: task.aiSuggestion,
                completed: task.completed,
                isAiGenerated: task.isAiGenerated,
              }));
              setTasks(refreshedTasks);
            }
          } else {
            setTasks([]);
          }
        } else {
          // Past date with no tasks
          setTasks([]);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // 2. Load Check-ins (Filter from full list)
    const fetchCheckIns = async () => {
      try {
        const response = await UserProfileService.getDailyCheckIns();
        if (response.success) {
          const dailyCheckIns = response.data.filter((log) =>
            log.date.startsWith(dateKey),
          );
          setCheckIns(dailyCheckIns);
        }
      } catch (e) {
        console.error("Failed to load calendar checkins", e);
      }
    };
    fetchCheckIns();
  }, [selectedDate]);

  const handleTaskToggle = async (taskId) => {
    try {
      // Optimistically update UI
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      );
      setTasks(updatedTasks);

      // Update in backend
      const task = tasks.find((t) => t.id === taskId);
      await TaskService.updateTaskStatus(taskId, !task.completed);
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert on error
      const revertedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      );
      setTasks(revertedTasks);
    }
  };

  const handleEditTasks = async () => {
    if (!editRequest.trim()) {
      alert("Please enter an edit request");
      return;
    }

    setEditLoading(true);
    try {
      const userId = localStorage.getItem("userId") || "unknown";
      const dateKey = formatDateKey(selectedDate);

      // Prepare request data - send full task objects
      const requestData = {
        user_id: userId,
        editRequest: editRequest,
        tasks: tasks, // Send full task objects
      };

      console.log("Sending edit request:", requestData);

      // Call AI edit endpoint
      const response = await axios({
        method: "post",
        url: "https://56d2bc5119c8.ngrok-free.app/edit_tasks",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        data: requestData,
      });

      console.log("Full response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("Response data type:", typeof response.data);

      // Parse edited tasks - AI returns tasks in 'output' field
      let editedTasks = [];
      if (
        response.data &&
        response.data.output &&
        Array.isArray(response.data.output)
      ) {
        editedTasks = response.data.output;
        console.log("Found tasks in response.data.output");
      } else if (
        response.data &&
        response.data.tasks &&
        Array.isArray(response.data.tasks)
      ) {
        editedTasks = response.data.tasks;
        console.log("Found tasks in response.data.tasks");
      } else if (Array.isArray(response.data)) {
        editedTasks = response.data;
        console.log("Response.data is an array");
      } else {
        console.log("Unexpected response format:", response.data);
        alert("Unexpected response format from AI. Check console for details.");
        return;
      }

      console.log("Parsed edited tasks:", editedTasks);

      if (editedTasks.length > 0) {
        console.log("Saving edited tasks to MongoDB with replace=true");

        // Save edited tasks to MongoDB (will replace existing)
        const saveResponse = await TaskService.saveAITasks(
          dateKey,
          editedTasks,
          true,
        );
        console.log("Save response:", saveResponse);

        // Refresh tasks from MongoDB
        console.log("Refreshing tasks from MongoDB");
        const refreshResponse = await TaskService.getTasksByDate(dateKey);
        console.log("Refresh response:", refreshResponse);

        if (refreshResponse.success) {
          const refreshedTasks = refreshResponse.data.map((task) => ({
            id: task._id,
            text: task.task,
            time: task.time,
            priority: task.priority,
            reason: task.reason,
            aiSuggestion: task.aiSuggestion,
            completed: task.completed,
            isAiGenerated: task.isAiGenerated,
          }));
          console.log("Setting refreshed tasks:", refreshedTasks);
          setTasks(refreshedTasks);
          alert(`Successfully updated ${refreshedTasks.length} tasks!`);
        }

        // Close modal and reset
        setShowEditModal(false);
        setEditRequest("");
      } else {
        alert("No edited tasks received from AI");
      }
    } catch (error) {
      console.error("Failed to edit tasks:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(
        `Failed to edit tasks: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6 flex flex-col h-[100vh] overflow-y-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon size={24} className="text-blue-600" />
          {selectedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your daily history and plan ahead
        </p>
      </div>

      {/* Sticky Calendar Strip - Updated to Circular Design */}
      <div className="-mx-4 px-4  backdrop-blur-sm sticky top-0 z-10 pb-2">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pt-2 px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dates.map((date, i) => {
            const isSelected =
              formatDateKey(date) === formatDateKey(selectedDate);
            const isCurrentDay = isToday(date);

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(date);
                  if (navigator.vibrate) navigator.vibrate(5);
                }}
                className="flex-shrink-0 flex flex-col items-center gap-2 w-14 group bg-white/80 p-3 rounded-2xl"
              >
                <span
                  className={`text-xs font-medium uppercase tracking-wider transition-colors
                                    ${isSelected ? "text-blue-600 font-bold" : "text-gray-400 group-hover:text-gray-600"}`}
                >
                  {date
                    .toLocaleDateString("en-US", { weekday: "short" })
                    .charAt(0)}
                </span>

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative
                                    ${
                                      isSelected
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                                        : "bg-transparent text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                                    }`}
                >
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
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group
                                        ${
                                          task.completed
                                            ? "bg-gray-50/50 border-gray-100 opacity-60"
                                            : "bg-white border-gray-100 hover:border-blue-200 shadow-sm"
                                        }`}
                >
                  <div className=" w-full flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                            ${task.completed ? "bg-blue-500 border-blue-500" : "border-gray-200 group-hover:border-blue-400"}`}
                    >
                      {task.completed && (
                        <CheckCircle size={14} className="text-white" />
                      )}
                    </div>
                    <div className="w-[100%]  flex align-center justify-between text-left">
                      <p
                        className={`font-medium transition-all
                                                ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}
                      >
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
                History: {tasks.filter((t) => t.completed).length}/
                {tasks.length} completed
              </div>
            )}

            {/* Edit Button - Only for Today */}
            {isToday(selectedDate) && tasks.length > 0 && (
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Edit2 size={18} />
                Edit Tasks with AI
              </button>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit Tasks</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRequest("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Tell the AI how you'd like to modify your tasks (e.g., "Make
                tasks easier", "Add more breaks", "Focus on deep work")
              </p>

              <textarea
                value={editRequest}
                onChange={(e) => setEditRequest(e.target.value)}
                placeholder="Enter your edit request..."
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold mb-1">Current Tasks:</p>
                <ul className="list-disc list-inside space-y-1">
                  {tasks.map((task, idx) => (
                    <li key={idx}>{task.text}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRequest("");
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditTasks}
                  disabled={editLoading || !editRequest.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? "Editing..." : "Submit"}
                </button>
              </div>
            </div>
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
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      {new Date(log.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold
                                            ${
                                              log.energyLevel >= 4
                                                ? "bg-green-100 text-green-700"
                                                : log.energyLevel >= 3
                                                  ? "bg-yellow-100 text-yellow-700"
                                                  : "bg-red-100 text-red-700"
                                            }`}
                    >
                      Energy: {log.energyLevel}/5
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2">
                      <Smile size={16} className="text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          Mood
                        </p>
                        <p className="font-semibold text-gray-700 text-sm">
                          {log.mood}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2">
                      <Moon size={16} className="text-blue-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          Sleep
                        </p>
                        <p className="font-semibold text-gray-700 text-sm">
                          {log.sleepQuality}
                        </p>
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
