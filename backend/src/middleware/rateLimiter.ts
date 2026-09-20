import rateLimit from 'express-rate-limit';

// Standard API rate limiter: 100 requests / 15 minutes per IP
export const generalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.'
    }
  }
});

// AI Assistant rate limiter: 20 requests / 15 minutes per IP
export const aiChatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'AI quota rate limit reached. Please wait before asking more questions.'
    }
  }
});

// ML Scanner rate limiter: 10 requests / 15 minutes per IP
export const mlScannerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Waste scan rate limit reached. Please wait before scanning more images.'
    }
  }
});
