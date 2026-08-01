import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes, createHmac } from "node:crypto";
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
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = async function(password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
};

userSchema.methods.generateAccessToken = function() {
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    return token;
};

userSchema.methods.generateRefreshToken = function() {
    const token = jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
    return token;
};

userSchema.methods.generateTemporaryToken = function() {
    const unHashed = randomBytes(128).toString("hex");
    const hashedToken = createHmac("sha512", unHashed).digest("hex");

    // above hashed token will expire in 20 mins
    const tokenExpiry = Date.now() + (20*60*1000);
    return { unHashed, hashedToken, tokenExpiry };
}

export const User = model("User", userSchema);
