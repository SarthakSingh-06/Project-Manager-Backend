import express from "express"; 
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();

// basic configuration
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb"  }));
app.use(express.static("public"));
app.use(cookieParser());

// configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"]
}));

// import the routes
import healthcheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.route.js";
import projectsRouter from "./routes/project.route.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects/", projectsRouter);

export { app };
