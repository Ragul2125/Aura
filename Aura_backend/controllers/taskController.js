import Task from "../model/Task.js";
import axios from "axios";

/**
 * Get tasks by specific date
 * GET /tasks/date/:date
 */
export const getTasksByDate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date } = req.params; // YYYY-MM-DD format

        const tasks = await Task.find({ userId, date }).sort({ time: 1, createdAt: 1 });

        res.status(200).json({
            success: true,
            data: tasks,
            date: date
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update task status (completed field)
 * PATCH /tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { completed } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: id, userId },
            { completed },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Save AI-generated tasks to MongoDB
 * POST /tasks/ai-sync
 * Body: { date: "YYYY-MM-DD", tasks: [...], replace: true/false }
 */
export const saveAIGeneratedTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, tasks, replace = false } = req.body;

        if (!date || !Array.isArray(tasks)) {
            return res.status(400).json({
                success: false,
                message: "Date and tasks array required"
            });
        }

        // Check if tasks already exist for this date
        const existingTasks = await Task.find({ userId, date });

        // If replace flag is true, delete existing tasks
        if (replace && existingTasks.length > 0) {
            await Task.deleteMany({ userId, date });
        } else if (existingTasks.length > 0 && !replace) {
            // Tasks already exist and replace is false, return them
            return res.status(200).json({
                success: true,
                data: existingTasks,
                message: "Tasks already exist for this date"
            });
        }

        // Map AI tasks to our schema
        const tasksToInsert = tasks.map(t => ({
            userId,
            task: t.task,
            time: t.time,
            priority: t.priority || "Medium",
            reason: t.reason || t.aiSuggestion || "",
            aiSuggestion: t.aiSuggestion || t.reason || "",
            avoid: t.avoid || false,
            isAiGenerated: t.is_AI_generated || t.isAiGenerated || false,
            completed: false,
            date
        }));

        const result = await Task.insertMany(tasksToInsert);

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Create a new task manually
 * POST /tasks
 */
export const createTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const task = new Task({
            userId,
            ...req.body
        });
        await task.save();
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get all tasks (with optional date filter)
 * GET /tasks?date=YYYY-MM-DD
 */
export const getTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date } = req.query;

        const query = { userId };
        if (date) {
            query.date = date;
        }

        const tasks = await Task.find(query).sort({ date: -1, time: 1, createdAt: 1 });
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update a task
 * PUT /tasks/:id
 */
export const updateTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const task = await Task.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get task statistics for the last 7 days
 * GET /tasks/statistics
 */
export const getTaskStatistics = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get last 7 days of dates
        const dates = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push({
                date: dateStr,
                name: dayNames[date.getDay()]
            });
        }

        // Get task stats for each date
        const statistics = await Promise.all(
            dates.map(async ({ date, name }) => {
                const allTasks = await Task.find({ userId, date });
                const completedTasks = allTasks.filter(t => t.completed);

                return {
                    name,
                    date,
                    tasks: completedTasks.length,
                    total: allTasks.length
                };
            })
        );

        res.status(200).json({ success: true, data: statistics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Delete a task
 * DELETE /tasks/:id
 */
export const deleteTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        await Task.findOneAndDelete({ _id: id, userId });
        res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
