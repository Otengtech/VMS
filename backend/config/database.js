import mongoose from 'mongoose';
import dotenv from "dotenv";

// Load env vars
dotenv.config();

// Cache the database connection
let cachedConnection = null;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

const connectDB = async (retryCount = 0) => {
  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => 
      key.includes('MONGODB') || key.includes('MONGO') || key === 'NODE_ENV'
    ));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not defined');
    } else {
      return null;
    }
  }

  // If we're in a serverless environment (Vercel) and have a cached connection, use it
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('✅ Using cached database connection');
      return cachedConnection;
    }
  }

  try {
    console.log('📡 Connecting to MongoDB...');
    console.log(`🔗 Connection string: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials
    
    // Mongoose 6+ options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
    console.log(`🔌 Connection state: ${mongoose.connection.readyState}`);
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error after connect:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    // Cache the connection for serverless
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      cachedConnection = conn;
    }
    
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`📋 Error details:`, {
      name: error.name,
      code: error.code,
      reason: error.reason
    });
    
    // Retry logic for serverless
    if (retryCount < MAX_ATTEMPTS && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
      console.log(`🔄 Retrying connection (attempt ${retryCount + 1}/${MAX_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return connectDB(retryCount + 1);
    }
    
    // In production, throw the error
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw error;
    }
    
    return null;
  }
};

// Helper function to check connection status
export const checkConnection = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

export default connectDB;