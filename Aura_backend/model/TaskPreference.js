import mongoose from "mongoose";

const taskPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        preferredTaskTypes: {
            type: [String],
            enum: ["Deep Focus", "Creative", "Social", "Physical"]
        },

        taskFlexibility: {
            type: String,
            enum: ["Fixed", "Reschedulable"]
        },

        breakPreference: {
            type: String,
            enum: ["Short", "Long", "None"]
        }
    },
    { timestamps: true }
);

export default mongoose.model("TaskPreference", taskPreferenceSchema);
