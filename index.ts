import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./src/middleware";
import { ENVIRONMENTS } from "./src/constants";
import { connectDB } from "./src/config";
import router from "./src/routes";

// ES6 modle __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
// URL encoded middleware
app.use(express.urlencoded({ extended: true }));

// Static folder for uploading files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", router);

//Error handler
app.use(errorHandler);
app.use(notFoundHandler);

// Start the server
app.listen(ENVIRONMENTS.PORT, () => {
  console.log(`Server is running on port ${ENVIRONMENTS.PORT}`);
});

process.on("unhandledRejection", (error: Error) => {
  console.log(`Error: ${error.message}`);
  process.exit(1);
});
