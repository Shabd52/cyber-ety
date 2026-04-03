import { Request, Response, NextFunction } from 'express';

/**
 * CORS middleware
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

/**
 * Body parser error handler
 */
export function bodyParserErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ success: false, error: 'Invalid JSON' });
  } else {
    next(error);
  }
}

/**
 * Session validation middleware
 */
export function validateSession(req: Request, res: Response, next: NextFunction) {
  // Check if refresh token is valid, refresh JWT if expired
  // In production, implement proper session management
  next();
}
