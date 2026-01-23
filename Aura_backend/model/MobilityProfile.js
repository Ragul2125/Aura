import mongoose from "mongoose";

const mobilitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        dailyCommuteMinutes: {
            type: Number
        },

        travelMode: {
            type: String,
            enum: ["Walk", "Bike", "Public Transport", "Cab", "Work From Home"]
        },

        postTravelFatigue: {
            type: Boolean,
            default: false
        },

        preferredRestDays: {
            type: [String],
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }
    },
    { timestamps: true }
);

export default mongoose.model("MobilityProfile", mobilitySchema);
