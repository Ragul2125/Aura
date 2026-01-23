import axios from 'axios';

// Configure base URL (update this when you have your backend URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    }
};

export default api;
