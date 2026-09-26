export const ENV = {
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyEcoSetuAI2026Fallback',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ecosetu-ai.firebaseapp.com',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ecosetu-ai',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ecosetu-ai.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1088492026',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '1:1088492026:web:ecosetu2026demo',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  ENABLE_DEMO_MODE: import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false',
  IS_DEV: import.meta.env.DEV,
} as const;
