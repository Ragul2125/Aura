/**
 * User Data Store
 * Simulates a backend database using localStorage for the defined Mongoose schemas.
 */

const STORAGE_KEYS = {
    USER_PROFILE: 'aura_user_profile',
    DAILY_CHECKINS: 'aura_daily_checkins',
    SLEEP_ROUTINE: 'aura_sleep_routine',
    FEMALE_CYCLE: 'aura_female_cycle',
    MALE_ENERGY: 'aura_male_energy',
    MOBILITY: 'aura_mobility',
    TASK_PREFS: 'aura_task_prefs',
    WEARABLE: 'aura_wearable',
    DAILY_TASKS: 'aura_daily_tasks' // New: Map of date -> tasks[]
};

// Helper: Get data
const get = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading from store', e);
        return null;
    }
};

// Helper: Save data
const save = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to store', e);
        return false;
    }
};

export const userDataStore = {
    // Check if onboarding is complete
    isOnboardingComplete: () => !!get(STORAGE_KEYS.USER_PROFILE),

    // User Profile
    getProfile: () => get(STORAGE_KEYS.USER_PROFILE),
    saveProfile: (data) => save(STORAGE_KEYS.USER_PROFILE, data),

    // Daily Check-ins (Array)
    getCheckIns: () => get(STORAGE_KEYS.DAILY_CHECKINS) || [],
    addCheckIn: (data) => {
        const list = get(STORAGE_KEYS.DAILY_CHECKINS) || [];
        const newItem = { ...data, date: new Date().toISOString() };
        list.unshift(newItem); // Add to top
        save(STORAGE_KEYS.DAILY_CHECKINS, list);
        return newItem;
    },

    // Gender Specific
    saveGenderData: (sex, data) => {
        if (sex === 'Female') return save(STORAGE_KEYS.FEMALE_CYCLE, data);
        if (sex === 'Male') return save(STORAGE_KEYS.MALE_ENERGY, data);
        return false;
    },

    // Other schemas
    saveSleepRoutine: (data) => save(STORAGE_KEYS.SLEEP_ROUTINE, data),
    saveMobility: (data) => save(STORAGE_KEYS.MOBILITY, data),
    saveTaskPrefs: (data) => save(STORAGE_KEYS.TASK_PREFS, data),

    // Daily Tasks History
    getDailyTasks: (dateStr) => {
        const allTasks = get(STORAGE_KEYS.DAILY_TASKS) || {};
        return allTasks[dateStr] || null;
    },
    saveDailyTasks: (dateStr, tasks) => {
        const allTasks = get(STORAGE_KEYS.DAILY_TASKS) || {};
        allTasks[dateStr] = tasks;
        save(STORAGE_KEYS.DAILY_TASKS, allTasks);
    },

    saveWearable: (data) => save(STORAGE_KEYS.WEARABLE, data),

    // Clear all tasks
    clearAllTasks: () => {
        localStorage.removeItem(STORAGE_KEYS.DAILY_TASKS);
        console.log('All tasks cleared from localStorage');
    },

    // Clear all data
    clearAllData: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('All user data cleared from localStorage');
    },

    // Get all data for export/debug
    getAllData: () => ({
        profile: get(STORAGE_KEYS.USER_PROFILE),
        sleep: get(STORAGE_KEYS.SLEEP_ROUTINE),
        mobility: get(STORAGE_KEYS.MOBILITY),
        tasks: get(STORAGE_KEYS.TASK_PREFS),
        checkins: get(STORAGE_KEYS.DAILY_CHECKINS),
        dailyTasks: get(STORAGE_KEYS.DAILY_TASKS)
    })
};
