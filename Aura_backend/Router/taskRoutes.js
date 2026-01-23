import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    syncTasksWithAI
} from "../controllers/taskController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// AI Sync Endpoint
router.post("/sync-ai", syncTasksWithAI);

export default router;
