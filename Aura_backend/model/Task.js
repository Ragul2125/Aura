import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        task: {
            type: String,
            required: true,
            trim: true
        },
        time: {
            type: String, // e.g. "09:00 AM - 11:00 AM"
            required: false
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        reason: {
            type: String,
            default: "" // AI reasoning for task placement
        },
        aiSuggestion: {
            type: String,
            default: "" // AI suggestion text
        },
        avoid: {
            type: Boolean,
            default: false
        },
        isAiGenerated: {
            type: Boolean,
            default: false
        },
        completed: {
            type: Boolean,
            default: false
        },
        date: {
            type: String, // YYYY-MM-DD format for simple filtering
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
