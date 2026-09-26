import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  get ENABLE_DEMO_AUTH() {
    return process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_AUTH === 'true';
  },
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'ecosetu-ai',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
};
