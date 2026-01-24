import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    getTasksByDate,
    updateTaskStatus,
    saveAIGeneratedTasks,
    getTaskStatistics
} from "../controllers/taskController.js";

const router = express.Router();

router.use(authMiddleware);

// Specific routes MUST come before parameterized routes
router.get("/statistics", getTaskStatistics); // Get task statistics for last 7 days
router.get("/date/:date", getTasksByDate); // Get tasks for specific date
router.post("/ai-sync", saveAIGeneratedTasks); // Save AI-generated tasks
router.patch("/:id/status", updateTaskStatus); // Update task completion status

// Task CRUD (generic routes come after specific ones)
router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
