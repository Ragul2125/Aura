import axios from 'axios';

// Configure base URL (update this when you have your backend URL)
const API_URL = import.meta.env.VITE_API_URL || 'https://aura-2-uibt.onrender.com/api';

// Create axios instance with auth interceptor
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken'); // Assuming you store auth token here
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AuthService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    }
};

export const UserProfileService = {
    // Step 1: Basic Profile
    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    // Step 2: Sleep Routine
    updateSleepRoutine: async (data) => {
        const response = await api.put('/user/sleep-routine', data);
        return response.data;
    },

    // Step 3: Mobility
    updateMobility: async (data) => {
        const response = await api.put('/user/mobility', data);
        return response.data;
    },

    // Step 4: Task Preferences
    updateTaskPreferences: async (data) => {
        const response = await api.put('/user/task-preferences', data);
        return response.data;
    },

    // Step 5: Gender Specifics (Cycle or Energy)
    updateBiologicalSpecifics: async (data) => {
        // data should include { type: 'female' | 'male', ...otherFields }
        const response = await api.put('/user/biological', data);
        return response.data;
    },

    // Daily Check-in
    addDailyCheckIn: async (data) => {
        const response = await api.post('/user/daily-checkin', data);
        return response.data;
    },

    // New: Get all profile data
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data; // Expects { success: true, data: { profile, sleep, ... } }
    },

    // New: Get check-in history
    getDailyCheckIns: async () => {
        const response = await api.get('/user/checkins');
        return response.data;
    }
};

export const TaskService = {
    // Get tasks for a specific date
    getTasksByDate: async (date) => {
        const response = await api.get(`/tasks/date/${date}`);
        return response.data;
    },

    // Update task completion status
    updateTaskStatus: async (taskId, completed) => {
        const response = await api.patch(`/tasks/${taskId}/status`, { completed });
        return response.data;
    },

    // Save AI-generated tasks to MongoDB
    saveAITasks: async (date, tasks, replace = false) => {
        const response = await api.post('/tasks/ai-sync', { date, tasks, replace });
        return response.data;
    },

    // Get task statistics for last 7 days
    getTaskStatistics: async () => {
        const response = await api.get('/tasks/statistics');
        return response.data;
    }
};

export default api;
