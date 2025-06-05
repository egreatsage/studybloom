import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI exists:', !!MONGODB_URI);
console.log('Environment:', process.env.NODE_ENV);

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads in development.
 * This prevents connections growing exponentially during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  console.log('connectDB called - cached connection exists:', !!cached.conn);
  
  if (cached.conn) {
    console.log('Returning cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    console.log('Connection established and cached');
    return cached.conn;
  } catch (error) {
    console.error('Failed to establish connection:', error);
    throw error;
  }
}

export default connectDB;
