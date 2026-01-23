import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        time: {
            type: String, // e.g. "09:00" or ISO Date string
            required: false // Optional, as some tasks might be backlog
        },
        duration: {
            type: Number, // in minutes
            default: 30
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed", "Skipped"],
            default: "Pending"
        },
        aiSuggestion: {
            type: String,
            default: "" // Reasoning from AI agent
        },
        isAiGenerated: {
            type: Boolean,
            default: false
        },
        date: {
            type: String, // ISO Date string YYYY-MM-DD for simple filtering
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
