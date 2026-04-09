import app from '../app.js';
import connectDB from '../config/database.js';

// Cache the database connection across function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    console.log('✅ Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Creating new database connection...');
    cached.promise = connectDB()
      .then((mongoose) => {
        console.log('✅ Database connected successfully');
        cached.conn = mongoose;
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ Database connection failed:', err);
        cached.promise = null;
        throw err;
      });
  }
  
  return cached.promise;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://vms-delta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Debug endpoint - remove in production
  if (req.url === '/api/debug') {
    return res.status(200).json({
      success: true,
      message: 'Debug endpoint',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
        FRONTEND_URL: process.env.FRONTEND_URL
      }
    });
  }

  try {
    // Connect to database
    console.log('📡 Attempting database connection...');
    await dbConnect();
    console.log('✅ Database connected, calling Express app');
    
    // Call the Express app
    app(req, res);
  } catch (err) {
    console.error('❌ Serverless function error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}