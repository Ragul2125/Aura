import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    "/signup",
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters long"),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
            .matches(/\d/)
            .withMessage("Password must contain at least one number"),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const { name, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }

            // Create new user (password will be hashed by pre-save middleware)
            const user = new User({
                name,
                email,
                password,
            });

            await user.save();

            // Generate JWT token
            const token = generateToken(user._id);

            // Return user data (excluding password)
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Server error during signup",
                error: error.message,
            });
        }
    }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post(
    "/login",
    [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;

            // Find user by email (include password for comparison)
            const user = await User.findOne({ email }).select("+password");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }

            // Generate JWT token
            const token = generateToken(user._id);

            // Return user data (excluding password)
            res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Server error during login",
                error: error.message,
            });
        }
    }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get("/me", authMiddleware, async (req, res) => {
    try {
        // User is already attached to req by authMiddleware
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                createdAt: req.user.createdAt,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile",
            error: error.message,
        });
    }
});

export default router;
