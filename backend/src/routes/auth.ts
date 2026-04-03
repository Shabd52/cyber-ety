import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import { verifyTeamAuth } from '../middleware/auth';
import { generateTeamToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new team
 * @access  Public
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { teamName, members, collegeId, password } = req.body;

    // Validation
    if (!teamName || !members || members.length !== 3 || !collegeId || !password) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: teamName, 3 members, collegeId, password',
      });
      return;
    }

    // Validate member names
    if (!members.every((m: any) => m.name && typeof m.name === 'string')) {
      res.status(400).json({
        success: false,
        error: 'Each member must have a name property',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate UUIDs
    const userId = uuidv4();
    const teamId = uuidv4();

    // Create user
    const userResult = await query(
      `INSERT INTO users (id, college_id, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, college_id`,
      [userId, collegeId, hashedPassword]
    );

    if (userResult.rows.length === 0) {
      res.status(400).json({ success: false, error: 'Failed to create user' });
      return;
    }

    // Create team
    await query(
      `INSERT INTO teams (id, user_id, team_name, college_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [teamId, userId, teamName, collegeId]
    );

    // Create team members
    for (let i = 0; i < members.length; i++) {
      await query(
        `INSERT INTO team_members (id, team_id, member_name, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), teamId, members[i].name]
      );
    }

    // Generate JWT token
    const token = generateTeamToken(userId, collegeId, teamId);

    res.status(201).json({
      success: true,
      data: {
        userId,
        teamId,
        teamName,
        collegeId,
        token,
        expiresIn: '7d',
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle duplicate college ID
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'College ID already registered',
      });
      return;
    }

    res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login team
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { collegeId, password } = req.body;

    if (!collegeId || !password) {
      res.status(400).json({
        success: false,
        error: 'Missing collegeId or password',
      });
      return;
    }

    // Find user by college ID
    const userResult = await query(
      `SELECT u.id, u.college_id, u.password_hash, t.id as team_id, t.team_name
       FROM users u
       LEFT JOIN teams t ON t.user_id = u.id
       WHERE u.college_id = $1`,
      [collegeId]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid college ID or password',
      });
      return;
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid college ID or password',
      });
      return;
    }

    // Generate JWT token
    const token = generateTeamToken(user.id, user.college_id, user.team_id);

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        teamId: user.team_id,
        teamName: user.team_name,
        collegeId: user.college_id,
        token,
        expiresIn: '7d',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout team
 * @access  Private
 */
router.post('/logout', verifyTeamAuth, (req: Request, res: Response) => {
  // JWT is stateless, so logout just returns success
  // Client-side should remove token from localStorage
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
