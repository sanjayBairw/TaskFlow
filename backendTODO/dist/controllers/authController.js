"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validation
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required',
            });
        }
        const emailTrimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
            return res.status(400).json({
                success: false,
                message: 'A valid email address is required',
            });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Password is required',
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }
        // Check duplicate email
        const existingUser = await User_1.User.findOne({ email: emailTrimmed });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }
        // Create user
        const user = new User_1.User({
            name: name.trim(),
            email: emailTrimmed,
            password,
        });
        await user.save();
        // Generate JWT
        const token = (0, jwt_1.generateToken)(user._id.toString());
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error('[Auth Controller] Register Error:', error instanceof Error ? error.message : error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }
        const emailTrimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
        // Find user with password selected
        const user = await User_1.User.findOne({ email: emailTrimmed }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        const token = (0, jwt_1.generateToken)(user._id.toString());
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error('[Auth Controller] Login Error:', error instanceof Error ? error.message : error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: 'Server error retrieving user details',
        });
    }
};
exports.getMe = getMe;
