import { Router } from "express";
import {
    registerUser, loginUser, logoutUser, getCurrentUser,
    verifyEmail, resendEmailVerificationMail,
    refreshAccessToken
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/current-user", verifyJWT, getCurrentUser);
router.get("/verify-email/:verificationToken", verifyJWT, verifyEmail);
router.post("/resend-email-verification/", verifyJWT, resendEmailVerificationMail);
router.post("/refresh-token/", verifyJWT, refreshAccessToken);

export default router;
