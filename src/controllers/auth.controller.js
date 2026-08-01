import { access } from "node:fs";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificatinMailgenContent, sendEmail } from "../utils/email.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.log("Access and refresh token generation failed");
        throw new ApiError(500, error.message);        
    }
};

export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role, fullname } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser)
        throw new ApiError(409, "User with email or username already exists");

    const newUser = await User.create({
        email, password, username, fullname,
        isEmailVerified: false
    });

    const { unHashed, hashedToken, tokenExpiry } = newUser.generateTemporaryToken();

    newUser.emailVerificationToken = hashedToken;
    newUser.emailVerificationTokenExpiry = tokenExpiry;

    await newUser.save({ validateBeforeSave: false });

    await sendEmail({
        email: newUser?.email,
        subject: "Please get your email verified",
        mailContent: emailVerificatinMailgenContent(newUser.username, `${req.protocol}://${req.get("host")}/api/v1/auth/vefiry-email/${unHashed}`)
    });

    const createdNewUser = await User.findById(newUser._id).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry"
    );

    if (!createdNewUser)
        throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(new ApiResponse(201, { user: createdNewUser }, "User has been registered successfully and verification email has been sent to you"));
});
