import DailyCheckIn from "../model/DailyCheckIn.js";
import WearableData from "../model/WearableData.js";

/**
 * Log Daily Check-In
 */
export const logDailyCheckIn = async (req, res) => {
    try {
        const userId = req.user._id;
        // We create a new entry every time for history
        const checkIn = new DailyCheckIn({
            userId,
            ...req.body
        });
        await checkIn.save();

        res.status(201).json({ success: true, data: checkIn });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Log Wearable Data
 */
export const logWearableData = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = new WearableData({
            userId,
            ...req.body
        });
        await data.save();

        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get Daily Logs (History)
 */
export const getDailyLogs = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 7;

        const logs = await DailyCheckIn.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
