import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('[Database] WARNING: MONGODB_URI is not defined in environment variables. Database connection skipped.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database connection error';
    console.error(`[Database] MongoDB Connection Error: ${errorMessage}`);
    console.warn('[Database] Server is running, but database features will be unavailable until MongoDB is connected.');
    return false;
  }
};
