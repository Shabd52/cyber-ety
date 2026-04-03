import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    collegeId: string;
    teamId?: string;
  };
  admin?: {
    id: string;
    username: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';

/**
 * Middleware to verify team authentication
 */
export function verifyTeamAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      collegeId: decoded.collegeId,
      teamId: decoded.teamId,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

/**
 * Middleware to verify admin authentication
 */
export function verifyAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'No admin token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
      res.status(403).json({ success: false, error: 'Insufficient privileges' });
      return;
    }
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid admin token' });
  }
}

/**
 * Generate JWT token for team
 */
export function generateTeamToken(userId: string, collegeId: string, teamId: string): string {
  return jwt.sign(
    {
      id: userId,
      collegeId,
      teamId,
      type: 'team',
    },
    JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRE || '7d' } as any
  );
}

/**
 * Generate JWT token for admin
 */
export function generateAdminToken(adminId: string, username: string, role: string): string {
  return jwt.sign(
    {
      id: adminId,
      username,
      role,
      type: 'admin',
    },
    JWT_SECRET as string,
    { expiresIn: '24h' } as any
  );
}

/**
 * Middleware for rate limiting
 */
export function rateLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Simple rate limiting - in production use 'express-rate-limit'
  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details,
    });
  } else if (error.name === 'UnauthorizedError') {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  } else {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
