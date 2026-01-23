import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    updateUserProfile,
    updateSleepRoutine,
    updateMobilityProfile,
    updateTaskPreferences,
    updateCycleOrEnergy,
    getUserProfile
} from "../controllers/profileController.js";
import { logDailyCheckIn, getDailyLogs } from "../controllers/loggingController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Profile Routes (PUT for updates)
router.get("/profile", getUserProfile); // New GET endpoint
router.put("/profile", updateUserProfile);
router.put("/sleep-routine", updateSleepRoutine);
router.put("/mobility", updateMobilityProfile);
router.put("/task-preferences", updateTaskPreferences);
router.put("/biological", updateCycleOrEnergy);

// Daily Check-in (POST & GET)
router.post("/daily-checkin", logDailyCheckIn);
router.get("/checkins", getDailyLogs); // New GET endpoint

export default router;
