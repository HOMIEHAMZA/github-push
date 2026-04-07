import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rate-limit.middleware';

// Route imports
import { authRoutes } from './routes/auth.routes';
import { productRoutes } from './routes/products.routes';
import { categoryRoutes } from './routes/categories.routes';
import { brandsRoutes } from './routes/brands.routes';
import { orderRoutes } from './routes/orders.routes';
import { cartRoutes } from './routes/cart.routes';
// import { userRoutes } from './routes/users.routes';
import { adminRoutes } from './routes/admin.routes';
import { builderRoutes } from './routes/builder.routes';
// import { reviewRoutes } from './routes/reviews.routes';
import { wishlistRoutes } from './routes/wishlist.routes';
import { addressRoutes } from './routes/addresses.routes';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    // Attach raw body to req object for webhook verification
    if (req.originalUrl.includes('/webhook')) {
      req.rawBody = buf;
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, apiLimiter, authRoutes);
app.use(`${API}/products`, apiLimiter, productRoutes);
app.use(`${API}/categories`, apiLimiter, categoryRoutes);
app.use(`${API}/brands`, apiLimiter, brandsRoutes);
app.use(`${API}/orders`, apiLimiter, orderRoutes);
app.use(`${API}/cart`, apiLimiter, cartRoutes);
// app.use(`${API}/users`, apiLimiter, userRoutes);
app.use(`${API}/admin`, apiLimiter, adminRoutes);
app.use(`${API}/builder`, apiLimiter, builderRoutes);
// app.use(`${API}/reviews`, apiLimiter, reviewRoutes);
app.use(`${API}/wishlist`, apiLimiter, wishlistRoutes);
app.use(`${API}/addresses`, apiLimiter, addressRoutes);

// ─── 404 Fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  
  // Log the error with request context
  console.error(`[Global Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    userId: (req as any).userId,
  });

  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
    details: process.env.NODE_ENV === 'production' ? undefined : err.details || err,
  });
});

// ─── Environment Verification & Startup ──────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const requiredEnv = [
    'FRONTEND_URL',
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  const missing = requiredEnv.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n❌ [DEATH KNELL] CRITICAL DEPLOYMENT BLOCKER`);
    console.error(`Missing required production environment variables:`);
    missing.forEach(m => console.error(`   - ${m}`));
    console.error(`The server cannot safely boot in production state without these defined. Process exiting.\n`);
    process.exit(1);
  }
}

app.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────┐
  │   ACCESSOMART API — Running on :${PORT}    │
  │   Environment: ${process.env.NODE_ENV?.padEnd(10)}              │
  │   Base URL: http://localhost:${PORT}/api/v1  │
  └──────────────────────────────────────────┘
  `);
});

export default app;
