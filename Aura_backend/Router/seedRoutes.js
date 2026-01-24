import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { seedDemoData } from "../controllers/seedController.js";

const router = express.Router();

router.use(authMiddleware);

// Seed demo data endpoint
router.post("/demo-data", seedDemoData);

export default router;
