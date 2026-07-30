import express from "express"; 
import cors from "cors";
import "dotenv/config";


const app = express();

// basic configuration
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb"  }));
app.use(express.static("public"));

// configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"]
}));

// import the routes
import healthcheckRouter from "./routes/healthcheck.route.js";

app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
