import { Schema, model } from "mongoose";
import { AvailableUserRoles } from "../constants.js";

const projectMemberSchema = new mongoose.Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Projects",
        required: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    role: {
        type: String,
        enum: AvailableUserRoles,
        default: "member",
    },

    joinedAt: {
        type: Date,
        default: Date.now,
    },

    addedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export const ProjectMembers = model("ProjectMembers", projectMemberSchema);
