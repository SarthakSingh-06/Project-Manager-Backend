import { z } from "zod";
import { AvailableUserRoles } from "../utils/constants.js";

export const registerPostRequestValidationSchema = z.object({
    email:  z.email("Zod validator: A valid email is required"),
    username: z.string("Username is required"),
    password: z.string("Password is required").min(8, "Your password must contain at least 8 characters"),
    role: z.enum(AvailableUserRoles).optional(),
    fullname: z.string("Your fullname is required")
});
