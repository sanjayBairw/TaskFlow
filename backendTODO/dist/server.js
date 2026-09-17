"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check Endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'TaskFlow API is running',
    });
});
// Mount API Routes
app.use('/api', routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server & Connect Database
const startServer = async () => {
    await (0, database_1.connectDB)();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`[Server] TaskFlow API is running on port ${PORT}`);
        console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
    });
};
startServer();
exports.default = app;
