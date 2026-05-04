import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import cron from "node-cron";
import fs from "fs";

import { connectDB } from "./src/lib/db.js";
import { initializeSocket } from "./src/lib/socket.js";

import userRoutes from "./src/routes/userRoute.js";
import adminRoutes from "./src/routes/adminRoute.js";
import authRoutes from "./src/routes/authRoute.js";
import songRoutes from "./src/routes/songRoute.js";
import albumRoutes from "./src/routes/albumRoute.js";
import statsRoutes from "./src/routes/statsRoute.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// create HTTP server (for socket.io)
const httpServer = createServer(app);
initializeSocket(httpServer);


// ✅ CORS CONFIG (dev + production)
const allowedOrigins = [
  "http://localhost:3000",
  "https://playlisten-me.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


// ✅ Middlewares
app.use(express.json());
app.use(clerkMiddleware());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })
);


// ✅ Cron job (cleanup temp files every hour)
const tempDir = path.join(process.cwd(), "tmp");

cron.schedule("0 * * * *", () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.log("Error reading temp folder:", err);
        return;
      }

      for (const file of files) {
        fs.unlink(path.join(tempDir, file), () => {});
      }
    });
  }
});


// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statsRoutes);


// ❌ DO NOT serve frontend (Vercel handles it)
// REMOVE any express.static / catch-all route


// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});


// ✅ Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});