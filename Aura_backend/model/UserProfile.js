import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        ageRange: {
            type: String,
            enum: ["18-25", "26-35", "36-45", "46+"],
            required: true
        },

        biologicalSex: {
            type: String,
            enum: ["Male", "Female", "Prefer not to say"],
            required: true
        },

        occupationType: {
            type: String,
            enum: ["Student", "Desk Job", "Field Work", "Shift Based", "Freelancer"],
            required: true
        },

        workingHours: {
            start: String,
            end: String
        },

        goals: {
            type: [String],
            enum: ["Productivity", "Balance", "Health"],
            default: ["Productivity"]
        }
    },
    { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);
