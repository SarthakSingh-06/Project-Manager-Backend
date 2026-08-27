import { Schema, model } from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true,
        required: true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    status: {
        type: String,
        enum: ["active", "completed"],
        default: "active",
    },

    startDate: {
        type: Date,
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    settings: {
        allowMemberTaskUpdates: {
            type: Boolean,
            default: true,
        },

        allowMemberSubtaskUpdates: {
            type: Boolean,
            default: true,
        },
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
}, {
    timestamps: true,
});

export const Projects = model("Projects", projectSchema);
