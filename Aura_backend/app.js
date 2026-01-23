import express from "express";
import cors from "cors";
import connectDb from "./Config/db.js";
import dotenv from "dotenv";
import authRoutes from "./Router/authRoutes.js";
import profileRoutes from "./Router/profileRoutes.js";
import loggingRoutes from "./Router/loggingRoutes.js";
import admin from "./firebaseAdmin.js";

dotenv.config();

connectDb();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tracking", loggingRoutes);

// FCM Token Storage Route
app.post("/save-token", (req, res) => {
  const { token } = req.body;

  // Save token in database (MongoDB / SQL)
  console.log("Token saved:", token);

  res.json({ message: "Token stored successfully" });
});

// FCM Notification Route
app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    await admin.messaging().send(message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
