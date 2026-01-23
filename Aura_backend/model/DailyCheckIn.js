import mongoose from "mongoose";

const dailyCheckInSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        energyLevel: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },

        mood: {
            type: String,
            enum: ["Calm", "Stressed", "Motivated", "Low", "Neutral"],
            required: true
        },

        sleepQuality: {
            type: String,
            enum: ["Poor", "Okay", "Good"],
            required: true
        },

        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export default mongoose.model("DailyCheckIn", dailyCheckInSchema);
