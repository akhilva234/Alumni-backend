import rateLimit from 'express-rate-limit';

// Global rate limiter applied to all requests
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: "Too many requests from this IP. Please try again after 15 minutes."
    }
});

// Stricter rate limiter for sensitive endpoints like auth (login, register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 requests per `window`
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts from this IP. Please try again after 15 minutes."
    }
});
