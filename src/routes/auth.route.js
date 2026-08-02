import { Router } from "express";
import {
    registerUser, loginUser, logoutUser, getCurrentUser,
    verifyEmail, resendEmailVerificationMail, changeCurrentPassword,
    refreshAccessToken, forgotPasswordRequest, resetForgotPassword
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// unsecured routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPasswordRequest);
router.post("/reset-password/:resetToken", resetForgotPassword);
router.post("/refresh-token/", refreshAccessToken);
router.get("/verify-email/:verificationToken", verifyEmail);

// secured routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/current-user", verifyJWT, getCurrentUser);
router.post("/resend-email-verification/", verifyJWT, resendEmailVerificationMail);
router.post("/change-password/", verifyJWT, changeCurrentPassword);

export default router;
