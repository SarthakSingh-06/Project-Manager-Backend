import { connect } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import "dotenv/config";

export const connectDB = async () => {
    try {
        const dbConnection = await connect(process.env.DATABASE_URL);
        console.log("Database connected!");
        console.log(`Host: ${dbConnection.connection.host}`);
        console.log(`Port: ${dbConnection.connection.port}`);
    } catch (error) {
        console.log("Failed connecting to database!!!");
        throw new ApiError(500, error.message);
    }
};
