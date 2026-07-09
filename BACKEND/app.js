const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const paperRoutes = require('./routes/paperRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Global rate limiter: 200 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Middlewares
app.use(globalLimiter);

// Helmet with Content-Security-Policy (matching PRD section 12.2)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", process.env.AI_SERVICE_URL || 'http://localhost:8080'],
        frameAncestors: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    xssFilter: true,
  })
);

// CORS config
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://ai-researchmind.netlify.app',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());

// HTTP logging (skip during testing to keep output clean)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routing mounts
app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);

// Error middleware
app.use(errorMiddleware);

module.exports = app;
