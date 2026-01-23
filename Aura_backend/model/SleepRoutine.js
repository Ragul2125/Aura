import mongoose from "mongoose";

const sleepRoutineSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        averageSleepHours: {
            type: Number,
            min: 3,
            max: 12
        },

        sleepConsistency: {
            type: String,
            enum: ["Fixed", "Irregular"]
        },

        peakAlertTime: {
            type: String,
            enum: ["Morning", "Afternoon", "Night"]
        }
    },
    { timestamps: true }
);

export default mongoose.model("SleepRoutine", sleepRoutineSchema);
