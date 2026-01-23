import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    logDailyCheckIn,
    logWearableData,
    getDailyLogs
} from "../controllers/loggingController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/daily-checkin", logDailyCheckIn);
router.post("/wearable-data", logWearableData);
router.get("/history", getDailyLogs);

export default router;
