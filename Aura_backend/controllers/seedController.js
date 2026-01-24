import Task from "../model/Task.js";
import User from "../model/User.js";
import DailyCheckIn from "../model/DailyCheckIn.js";

/**
 * Seed demo data for testing
 * POST /api/seed/demo-data
 */
export const seedDemoData = async (req, res) => {
    try {
        console.log("Seed demo data called for user:", req.user._id);
        const userId = req.user._id;

        // Clear existing data for this user
        console.log("Deleting existing tasks and check-ins...");
        const deletedTasks = await Task.deleteMany({ userId });
        const deletedCheckIns = await DailyCheckIn.deleteMany({ userId });
        console.log(`Deleted ${deletedTasks.deletedCount} tasks and ${deletedCheckIns.deletedCount} check-ins`);

        const demoTasks = [];
        const demoCheckIns = [];

        // Generate tasks and check-ins for past 10 days + today + next 2 days
        for (let i = -10; i <= 2; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Determine if it's a past date
            const isPast = i < 0;
            const isToday = i === 0;

            // Create varied tasks for each day
            const dayTasks = [
                {
                    userId,
                    task: "Morning Meditation",
                    time: "07:00 AM - 07:30 AM",
                    priority: "Medium",
                    reason: "Starting the day with mindfulness improves focus and reduces stress",
                    aiSuggestion: "User's historical data shows better productivity when starting with meditation",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.3 : false, // 70% completion for past
                    date: dateStr
                },
                {
                    userId,
                    task: "Deep Work Session",
                    time: "09:00 AM - 11:00 AM",
                    priority: "High",
                    reason: "Peak energy hours for focused work based on historical patterns",
                    aiSuggestion: "User completes complex tasks best during morning hours",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.2 : false, // 80% completion for past
                    date: dateStr
                },
                {
                    userId,
                    task: "Lunch Break",
                    time: "12:30 PM - 01:00 PM",
                    priority: "Low",
                    reason: "Regular meal times support energy regulation",
                    aiSuggestion: "Consistent lunch schedule helps maintain afternoon energy",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.1 : false, // 90% completion for past
                    date: dateStr
                },
                {
                    userId,
                    task: "Team Meeting",
                    time: "02:00 PM - 03:00 PM",
                    priority: "Medium",
                    reason: "Afternoon slot suitable for collaborative work",
                    aiSuggestion: "User's energy dips slightly post-lunch, good for social tasks",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.25 : false, // 75% completion for past
                    date: dateStr
                },
                {
                    userId,
                    task: "Exercise",
                    time: "06:00 PM - 07:00 PM",
                    priority: "High",
                    reason: "Evening exercise helps with sleep quality and stress relief",
                    aiSuggestion: "User's sleep data improves with evening physical activity",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.4 : false, // 60% completion for past
                    date: dateStr
                },
                {
                    userId,
                    task: "Reading",
                    time: "09:00 PM - 09:30 PM",
                    priority: "Low",
                    reason: "Wind-down activity before sleep",
                    aiSuggestion: "Reading before bed supports better sleep quality",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.5 : false, // 50% completion for past
                    date: dateStr
                }
            ];

            // Add some variation for weekends
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                dayTasks.push({
                    userId,
                    task: "Family Time",
                    time: "10:00 AM - 12:00 PM",
                    priority: "High",
                    reason: "Weekend quality time with loved ones",
                    aiSuggestion: "Social connections improve overall well-being",
                    avoid: false,
                    isAiGenerated: true,
                    completed: isPast ? Math.random() > 0.2 : false,
                    date: dateStr
                });
            }

            demoTasks.push(...dayTasks);

            // Create daily check-in for past days and today only
            if (isPast || isToday) {
                const moods = ["Calm", "Stressed", "Motivated", "Low", "Neutral"];
                const sleepQualities = ["Poor", "Okay", "Good"];

                // Simulate realistic patterns
                const energyLevel = Math.floor(Math.random() * 3) + 2; // 2-5
                const mood = moods[Math.floor(Math.random() * moods.length)];
                const sleepQuality = sleepQualities[Math.floor(Math.random() * sleepQualities.length)];

                demoCheckIns.push({
                    userId,
                    energyLevel,
                    mood,
                    sleepQuality,
                    date: new Date(dateStr)
                });
            }
        }

        // Insert all demo data
        console.log(`Inserting ${demoTasks.length} tasks and ${demoCheckIns.length} check-ins...`);
        const insertedTasks = await Task.insertMany(demoTasks);
        const insertedCheckIns = await DailyCheckIn.insertMany(demoCheckIns);
        console.log(`Successfully inserted ${insertedTasks.length} tasks and ${insertedCheckIns.length} check-ins`);

        res.status(201).json({
            success: true,
            message: `Created demo data successfully`,
            data: {
                tasks: {
                    total: demoTasks.length,
                    dateRange: {
                        from: demoTasks[0].date,
                        to: demoTasks[demoTasks.length - 1].date
                    }
                },
                checkIns: {
                    total: demoCheckIns.length,
                    dateRange: {
                        from: demoCheckIns[0].date.toISOString().split('T')[0],
                        to: demoCheckIns[demoCheckIns.length - 1].date.toISOString().split('T')[0]
                    }
                }
            }
        });
    } catch (error) {
        console.error("Seed demo data error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
};
