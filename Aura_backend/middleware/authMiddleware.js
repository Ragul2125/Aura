import jwt from "jsonwebtoken";
import User from "../model/User.js";

/**
 * Middleware to verify JWT token and authenticate user
 * Usage: Add this middleware to routes that require authentication
 * Example: router.get('/protected', authMiddleware, controller)
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        // Extract token (format: "Bearer TOKEN")
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Invalid token format.",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database (excluding password)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Token is invalid.",
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during authentication.",
            error: error.message,
        });
    }
};

export default authMiddleware;
