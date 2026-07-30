import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { ApiError } from "./utils/ApiError.js";
import "dotenv/config";

const PORT = process.env.PORT ?? 8000;

connectDB()
.then(() => {
    app.listen(PORT, console.log(`Server is running at http://localhost:${PORT}`));
})
.catch((error) => {
    console.log("Connection to database failed!");
    throw new ApiError(500, error.message);
});
