import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
  });
});

// Mount API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`[Server] TaskFlow API is running on port ${PORT}`);
    console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
  });
};

startServer();

export default app;
