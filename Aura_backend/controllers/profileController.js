import UserProfile from "../model/UserProfile.js";
import SleepRoutine from "../model/SleepRoutine.js";
import MobilityProfile from "../model/MobilityProfile.js";
import TaskPreference from "../model/TaskPreference.js";
import FemaleCycle from "../model/FemaleCycle.js";
import MaleEnergyPattern from "../model/MaleEnergyPattern.js";

/**
 * Update or Create User Profile (Step 1)
 */
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { ageRange, biologicalSex, occupationType, workingHours, goals } = req.body;

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { userId, ageRange, biologicalSex, occupationType, workingHours, goals },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update Sleep Routine (Step 2)
 */
export const updateSleepRoutine = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        const sleep = await SleepRoutine.findOneAndUpdate(
            { userId },
            { userId, ...data },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: sleep });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update Mobility Profile (Step 2/3)
 */
export const updateMobilityProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        const mobility = await MobilityProfile.findOneAndUpdate(
            { userId },
            { userId, ...data },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: mobility });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update Task Preferences (Step 3)
 */
export const updateTaskPreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        const prefs = await TaskPreference.findOneAndUpdate(
            { userId },
            { userId, ...data },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: prefs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update Biological Specifics (Step 4 - Conditional)
 */
export const updateCycleOrEnergy = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type, ...data } = req.body; // type = 'female' or 'male'

        let result;
        if (type === 'female') {
            result = await FemaleCycle.findOneAndUpdate(
                { userId },
                { userId, ...data },
                { new: true, upsert: true }
            );
        } else {
            result = await MaleEnergyPattern.findOneAndUpdate(
                { userId },
                { userId, ...data },
                { new: true, upsert: true }
            );
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get Full User Profile (Aggregated)
 */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all data in parallel
        const [profile, sleep, mobility, tasks, female, male] = await Promise.all([
            UserProfile.findOne({ userId }),
            SleepRoutine.findOne({ userId }),
            MobilityProfile.findOne({ userId }),
            TaskPreference.findOne({ userId }),
            FemaleCycle.findOne({ userId }),
            MaleEnergyPattern.findOne({ userId })
        ]);

        // Construct response matching frontend structure
        const responseData = {
            profile,
            sleep,
            mobility,
            tasks,
            biological: profile?.biologicalSex === 'Female' ? female : male
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
