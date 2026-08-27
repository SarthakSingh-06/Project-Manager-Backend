import { Schema, model } from "mongoose";
import { AvailableTaskStatus } from "../constants.js";

const taskSchema = new mongoose.Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Projects",
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
        index: true,
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

    status: {
        type: String,
        enum: AvailableTaskStatus,
        default: "todo",
    },

    dueDate: {
        type: Date,
    },

    completedAt: {
        type: Date,
    },

}, {
    timestamps: true,
});
