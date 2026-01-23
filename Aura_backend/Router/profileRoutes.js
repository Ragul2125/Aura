import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    updateUserProfile,
    updateSleepRoutine,
    updateMobilityProfile,
    updateTaskPreferences,
    updateCycleOrEnergy
} from "../controllers/profileController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/user-profile", updateUserProfile);
router.post("/sleep-routine", updateSleepRoutine);
router.post("/mobility-profile", updateMobilityProfile);
router.post("/task-preference", updateTaskPreferences);
router.post("/bio-specific", updateCycleOrEnergy);

export default router;
