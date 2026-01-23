import Task from "../model/Task.js";

/**
 * Create a new task
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
 * Get tasks (filter by date optionally)
 */
export const getTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date } = req.query; // YYYY-MM-DD

        const query = { userId };
        if (date) {
            query.date = date;
        }

        const tasks = await Task.find(query).sort({ time: 1, createdAt: 1 });
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update a task
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
 * Delete a task
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

/**
 * Sync Tasks (AI Agent / Bulk Update)
 * Expects { tasks: [ { ...taskData }, ... ] }
 * Can replace all tasks for a date or update specific ones.
 * For now, let's implement a "replace for date" strategy or "upsert list" strategy.
 * "Upsert List" is safer.
 */
export const syncTasksWithAI = async (req, res) => {
    try {
        const userId = req.user._id;
        const { tasks, date } = req.body;

        if (!date || !Array.isArray(tasks)) {
            return res.status(400).json({ success: false, message: "Date and tasks array required" });
        }

        // Strategy: Delete existing tasks for this date and insert new ones (Full Sync)
        // OR: Smart update. Let's do Full Sync for the specific date for simplicity if AI re-optimizes the whole day.

        // 1. Delete all tasks for this user on this date
        await Task.deleteMany({ userId, date });

        // 2. Insert new tasks
        const tasksToInsert = tasks.map(t => ({
            ...t,
            userId,
            date,
            isAiGenerated: true // Mark as AI touched if coming through this endpoint
        }));

        const result = await Task.insertMany(tasksToInsert);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
