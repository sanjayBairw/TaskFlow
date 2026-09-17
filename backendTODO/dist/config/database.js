"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.warn('[Database] WARNING: MONGODB_URI is not defined in environment variables. Database connection skipped.');
        return false;
    }
    try {
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown database connection error';
        console.error(`[Database] MongoDB Connection Error: ${errorMessage}`);
        console.warn('[Database] Server is running, but database features will be unavailable until MongoDB is connected.');
        return false;
    }
};
exports.connectDB = connectDB;
