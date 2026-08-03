import "dotenv/config";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificatinMailgenContent, forgorPasswordMailgenContent, sendEmail } from "../utils/email.js";
import {
    registerPostRequestValidationSchema,
    loginPostRequestValidationSchema,
    forgotPasswordRequestValidationSchema,
    resetPasswordRequestValidationSchema,
    changeCurrentPasswordRequestValidationSchema
} from "../validators/user.validator.js";
import jwt from "jsonwebtoken";
import { createHmac } from "node:crypto";

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
    const validationResult = await registerPostRequestValidationSchema.safeParseAsync(req.body);

    if (validationResult.error)
        throw new ApiError(400, validationResult.error.format());

    const { email, username, password, role, fullname } = validationResult.data;

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
        mailContent: emailVerificatinMailgenContent(newUser.username, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashed}`)
    });

    const createdNewUser = await User.findById(newUser._id).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry -createdAt -updatedAt"
    );

    if (!createdNewUser)
        throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(new ApiResponse(201, { user: createdNewUser }, "User has been registered successfully and verification email has been sent to you"));
});

export const loginUser = asyncHandler(async (req, res) => {
    const validationResult = await loginPostRequestValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw new ApiError(400, JSON.stringify(validationResult.error.format()));

    const { email, password } = validationResult.data;

    const existingUser = await User.findOne({ email });

    if (!existingUser)
        throw new ApiError(401, `User with email ${email} does not exist`);

    const correctpassword = await existingUser.isPasswordCorrect(password);
    if (!correctpassword)
        throw new ApiError(401, "Incorrect password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id);

    const loggedInUser = await User.findById(existingUser._id).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry -createdAt -updatedAt"
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json( new ApiResponse(200, { userData: loggedInUser }, "User logged in successfully") );
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {
            returnDocument: "after" // return the document after changes are made
        }
    );

    const options = {
        httpOnly:  true,
        secure:  true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "Current user fetched successfully")
        );
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const verificationToken = req.params.verificationToken;
    if (!verificationToken)
        throw new ApiError(400, "Email verification token is missing");

    const newHash = createHmac("sha512", verificationToken).digest("hex");

    const user = await User.findOne({
        emailVerificationToken: newHash,
        emailVerificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
        throw new ApiError(400, "Your email verification token is invalid or expired. Please generate a new one.");

    // cleanups
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Your email has beed verified")
        );
});

export const resendEmailVerificationMail = asyncHandler(async (req, res) => {
    const existingUser = await User.findById(req.user?.id);

    if (!existingUser)
        throw new ApiError(404, "User does not exist");
    if (existingUser.isEmailVerified)
        throw new ApiError(409, "Email is already verified");

    const { unHashed, hashedToken, tokenExpiry } = existingUser.generateTemporaryToken();

    existingUser.emailVerificationToken = hashedToken;
    existingUser.emailVerificationTokenExpiry = tokenExpiry;

    await existingUser.save({ validateBeforeSave: false });
    await sendEmail({
        email: existingUser?.email,
        subject: "Please get your email verified",
        mailContent: emailVerificatinMailgenContent(existingUser.username, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashed}`)
    });

    return res.status(200).json(new ApiResponse(200, {}, "Verification email has been sent to you"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken)
        throw new ApiError(401, "Unauthorized access");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user)
            throw new ApiError(401, "Invalid refresh token");
        if (incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, "Refresh token is expired");

        const cookieOptions = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user?._id);
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
            );

    } catch (error) {
        throw new ApiError(401, error.message);
    }
});

export const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const validationResult = await forgotPasswordRequestValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw new ApiError(400, validationResult.error.format());

    const { email } = validationResult.data;

    const user = await User.findOne({ email });

    if (!user)
        throw new ApiError(404, `User with email ${email} does not exist`);

    const { unHashed, hashedToken, tokenExpiry } = await user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Password reset request",
        mailContent: forgorPasswordMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashed}`)
    });

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Reset password mail has been sent to you")
        );
});

export const resetForgotPassword = asyncHandler(async (req, res) => {
    const validationResult = await resetPasswordRequestValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw new ApiError(400, JSON.stringify(validationResult.error.format()));

    const { newPassword } = validationResult.data;

    const resetToken = req.params.resetToken;
    const newHash = await createHmac("sha512", resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: newHash,
        forgotPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
        throw new ApiError(404, "Token is invalid or expired");

    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json( new ApiResponse(200, {}, "Password reset successfully") );
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const validationResult = await changeCurrentPasswordRequestValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw new ApiError(400, JSON.stringify(validationResult.error.format()));

    const { oldPassword, newPassword } = validationResult.data;
    const user = await User.findById(req.user?.id);

    const correctPassword = await user.isPasswordCorrect(oldPassword);

    if (!correctPassword)
        throw new ApiError(401, "Incorrect current password provided");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json( new ApiResponse(200, {}, "Password changed successfully") );
});
