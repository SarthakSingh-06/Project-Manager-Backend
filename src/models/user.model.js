import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const userSchema = new Schema({
    profileImage: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: "https://placehold.co/200x200",
            localPath: ""
        }
    },
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required."]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordTokenExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationTokenExpiry: {
        type: Date
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
};

userSchema.methods.generateAccessToken = function() {
    
};

export const User = model("User", userSchema);
