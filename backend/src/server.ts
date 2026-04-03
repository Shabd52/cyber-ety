import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import http from 'http';
import { initializeSocket } from './socket';
import { pool } from './db/connection';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running' });
});

// Import routes
import authRoutes from './routes/auth';
import teamRoutes from './routes/team';
import gameRoutes from './routes/game';
import submissionRoutes from './routes/submission';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error : undefined,
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  Cyber Etymology Server               ║
  ║  Running on port ${PORT}                 ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

export default app;
