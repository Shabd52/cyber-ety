import { Router, Request, Response } from 'express';
import { verifyTeamAuth } from '../middleware/auth';
import { query, pool } from '../db/connection';
import { validateWord, calculateScore } from '../utils/validation';
import { SOCKET_EVENTS } from '@cyber-etymology/shared';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Store current game state globally for this session
const gameState: {
  gameId: string | null;
  sessionId: string | null;
  questions: any[];
  currentQuestionIndex: number;
  teams: Map<string, { teamId: string; teamName: string; score: number; answers: string[] }>;
} = {
  gameId: null,
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  teams: new Map(),
};

/**
 * @route   POST /api/submission/answer
 * @desc    Submit answer for a question
 * @access  Private (Team)
 */
router.post('/answer', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    const { gameId, questionIndex, word, timeSpent } = req.body;
    const teamId = (req as any).user?.teamId; // Added by middleware

    if (!gameId || questionIndex === undefined || !word) {
      res.status(400).json({
        success: false,
        error: 'Missing gameId, questionIndex, or word',
      });
      return;
    }

    if (!teamId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - no team ID',
      });
      return;
    }

    // Get the question
    const questionResult = await pool.query(
      'SELECT id, characters, question_type FROM questions WHERE game_session_id = $1 AND question_index = $2',
      [gameId, questionIndex + 1]
    );

    if (questionResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Question not found',
      });
      return;
    }

    const question = questionResult.rows[0];
    const characters = [question.characters]; // Single character stored as VARCHAR(10)

    // Validate word
    const validation = validateWord(word, question.question_type, characters);

    let score = 0;
    if (validation.isValid) {
      score = calculateScore(word);
    }

    // Store answer in database
    await pool.query(
      'INSERT INTO answers (id, question_id, game_session_id, team_id, word, is_valid, score, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [uuidv4(), question.id, gameId, teamId, word, validation.isValid, validation.isValid ? score : 0, new Date()]
    );

    // Advance to next question in database
    const maxQuestions = 5; // Total questions per game
    const updateResult = await pool.query(
      'UPDATE game_sessions SET current_question_index = CASE WHEN current_question_index < $1 THEN current_question_index + 1 ELSE current_question_index END WHERE id = $2 RETURNING current_question_index',
      [maxQuestions, gameId]
    );

    // Update team score
    const totalScoreResult = await pool.query(
      'SELECT COALESCE(SUM(score), 0) as total_score FROM answers WHERE game_session_id = $1 AND team_id = $2',
      [gameId, teamId]
    );
    const totalScore = totalScoreResult.rows[0].total_score;

    // Get leaderboard
    const leaderboardResult = await pool.query(`
      SELECT 
        t.id as team_id,
        t.team_name,
        COALESCE(SUM(a.score), 0) as score,
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(a.score), 0) DESC) as rank
      FROM teams t
      LEFT JOIN answers a ON t.id = a.team_id AND a.game_session_id = $1
      GROUP BY t.id, t.team_name
      ORDER BY score DESC
    `, [gameId]);

    const leaderboard = leaderboardResult.rows.map(row => ({
      rank: row.rank,
      teamName: row.team_name,
      score: row.score,
    }));

    res.json({
      success: true,
      data: {
        isValid: validation.isValid,
        score: validation.isValid ? score : 0,
        totalScore,
        reason: validation.message,
        leaderboard,
      },
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit answer' });
  }
});

/**
 * @route   POST /api/submission/skip
 * @desc    Skip current question
 * @access  Private (Team)
 */
router.post('/skip', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    const { gameId, questionIndex } = req.body;
    const teamId = (req as any).user?.teamId;

    if (!gameId || questionIndex === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing gameId or questionIndex',
      });
      return;
    }

    if (!teamId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - no team ID',
      });
      return;
    }

    // Record skip (answer with no score)
    const questionResult = await pool.query(
      'SELECT id FROM questions WHERE game_session_id = $1 AND question_index = $2',
      [gameId, questionIndex + 1]
    );

    if (questionResult.rows.length > 0) {
      await pool.query(
        'INSERT INTO answers (id, question_id, game_session_id, team_id, word, is_valid, score, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [uuidv4(), questionResult.rows[0].id, gameId, teamId, '(skipped)', false, 0, new Date()]
      );
    }

    // Advance to next question in database
    const maxQuestions = 5; // Total questions per game
    await pool.query(
      'UPDATE game_sessions SET current_question_index = CASE WHEN current_question_index < $1 THEN current_question_index + 1 ELSE current_question_index END WHERE id = $2',
      [maxQuestions, gameId]
    );

    res.json({
      success: true,
      message: 'Question skipped',
    });
  } catch (error) {
    console.error('Skip error:', error);
    res.status(500).json({ success: false, error: 'Failed to skip question' });
  }
});

/**
 * @route   GET /api/submission/answers/:questionId
 * @desc    Get all answers for a question
 * @access  Admin only
 */
router.get('/answers/:questionId', async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const result = await pool.query(
      'SELECT team_id, word, is_valid, score FROM answers WHERE question_id = $1 ORDER BY created_at DESC',
      [questionId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get answers' });
  }
});

export default router;
