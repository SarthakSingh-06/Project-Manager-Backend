import "dotenv/config";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");

    if (!token)
        throw new ApiError(401, "Unauthorized request. User is not loggedin");

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const existingUser = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry -createdAt -updatedAt" );

        if (!existingUser)
            throw new ApiError(401, "Invalid access token provided.");

        req.user = existingUser;
        next();
    } catch (error) {
        throw new ApiError(401, error.message); 
    }
});
