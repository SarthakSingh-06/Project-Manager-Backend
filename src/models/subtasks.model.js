import { Schema, model } from "mongoose";
import { AvailableTaskStatus } from "../constants.js";

const subTaskSchema = new mongoose.Schema({
    taskId: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true,
        index: true,
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

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    status: {
        type: String,
        enum: AvailableTaskStatus,
        default: "todo",
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    completedAt: {
        type: Date,
    }
}, {
    timestamps: true,
});

export const SubTasks = model("SubTasks", subTaskSchema);
