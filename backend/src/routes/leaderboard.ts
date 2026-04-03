import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route   GET /api/leaderboard/current
 * @desc    Get current leaderboard standings
 * @access  Public
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get leaderboard
    res.json({
      success: true,
      data: {
        standings: [],
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
  }
});

/**
 * @route   GET /api/leaderboard/finals
 * @desc    Get finals round standings
 * @access  Public
 */
router.get('/finals', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get finals leaderboard
    res.json({
      success: true,
      data: {
        standings: [],
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get finals leaderboard' });
  }
});

export default router;
