import mongoose from "mongoose";

const wearableDataSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        stepCount: Number,
        restingHeartRate: Number,
        sleepStages: {
            deep: Number,
            light: Number,
            rem: Number
        },

        activityIntensity: {
            type: String,
            enum: ["Low", "Moderate", "High"]
        },

        recordedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export default mongoose.model("WearableData", wearableDataSchema);
