import mongoose from "mongoose";

const femaleCycleSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        cycleStartDate: {
            type: Date
        },

        averageCycleLength: {
            type: Number,
            default: 28
        },

        symptoms: {
            type: [String],
            enum: ["Fatigue", "Cramps", "Brain Fog", "High Energy"]
        }
    },
    { timestamps: true }
);

export default mongoose.model("FemaleCycle", femaleCycleSchema);
