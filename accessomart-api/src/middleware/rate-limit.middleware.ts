import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';

/**
 * General API Limiter
 * Applied to most routes to prevent system-wide abuse.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 2000, // 100 requests per IP per 15 min in prod
  message: { error: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sensitive Auth Actions Limiter (Login/Register)
 * Relaxed from 10 to 30 attempts per 15 minutes to allow for human error
 * while still protecting against automated brute-force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 30 : 200, 
  message: { error: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ensure that hits to general auth (like /me) don't count towards this quota
  // by keeping this instance separate and applying it only to login/register routes.
});
