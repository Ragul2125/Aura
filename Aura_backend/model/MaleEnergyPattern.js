import mongoose from "mongoose";

const maleEnergySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        stressLevel: {
            type: String,
            enum: ["Low", "Medium", "High"]
        },

        workoutFrequency: {
            type: String,
            enum: ["None", "1-2/week", "3-5/week", "Daily"]
        },

        energyCrashTime: {
            type: String
        }
    },
    { timestamps: true }
);

export default mongoose.model("MaleEnergyPattern", maleEnergySchema);
