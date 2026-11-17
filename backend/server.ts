import express, { Request, Response, NextFunction } from 'express';
import { apiRouter } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Flexible CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON & URL-encoded Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Mount API routes (handles both direct /api routes and Vercel serverless rewrites)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred in VendorIQ API engine.',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  VendorIQ Enterprise Backend Server`);
    console.log(`  Listening on http://localhost:${PORT}`);
    console.log(`  API Base:   http://localhost:${PORT}/api`);
    console.log(`  SSE Stream: http://localhost:${PORT}/api/notifications/stream`);
    console.log(`====================================================`);
  });
}

export default app;
