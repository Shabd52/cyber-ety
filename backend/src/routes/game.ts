import { Router, Request, Response } from 'express';
import { verifyAdminAuth, verifyTeamAuth } from '../middleware/auth';
import { pool, query } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';
import { TECH_GLOSSARY } from '@cyber-etymology/shared';

const router = Router();

// Store all active game sessions
const activeSessions = new Map<string, {
  gameId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'ended';
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: any[];
}>();

// Helper function to extract viable starting letters from tech glossary
function getViableStartingLetters(): string[] {
  const letterCount: Record<string, number> = {};
  
  TECH_GLOSSARY.forEach(word => {
    const firstLetter = word[0].toLowerCase();
    letterCount[firstLetter] = (letterCount[firstLetter] || 0) + 1;
  });

  // Return letters that appear at least twice (more likely to have valid words)
  return Object.entries(letterCount)
    .filter(([_, count]) => count >= 2)
    .map(([letter]) => letter);
}

// Helper function to extract viable letter pairs from tech glossary
function getViableLetterPairs(): string[] {
  const pairs = new Set<string>();
  
  TECH_GLOSSARY.forEach(word => {
    // For each word, extract all consecutive letter pairs
    for (let i = 0; i < word.length - 1; i++) {
      const pair = word.substring(i, i + 2).toLowerCase();
      pairs.add(pair);
    }
  });

  // Convert to array and shuffle
  return Array.from(pairs).sort(() => 0.5 - Math.random());
}

// Helper function to select random viable letters
function getRandomViableLetter(startingLettersOnly = false): string {
  const viableLetters = getViableStartingLetters();
  return viableLetters[Math.floor(Math.random() * viableLetters.length)] || 'a';
}

function getRandomViablePair(): string {
  const pairs = getViableLetterPairs();
  return pairs[Math.floor(Math.random() * pairs.length)] || 'al';
}

// Get or create a sample question set
async function getOrCreateQuestions(gameId: string): Promise<any[]> {
  const questions = [
    { index: 1, type: 'START', characters: getRandomViableLetter(), timeLimit: 30 },
    { index: 2, type: 'START', characters: getRandomViableLetter(), timeLimit: 30 },
    { index: 3, type: 'START', characters: getRandomViableLetter(), timeLimit: 30 },
    { index: 4, type: 'CONTAIN', characters: getRandomViablePair(), timeLimit: 60 },
    { index: 5, type: 'CONTAIN', characters: getRandomViablePair(), timeLimit: 60 },
  ];

  // Store in database
  for (const q of questions) {
    const existingQ = await pool.query(
      'SELECT id FROM questions WHERE game_session_id = $1 AND question_index = $2 LIMIT 1',
      [gameId, q.index]
    );

    if (existingQ.rows.length === 0) {
      await pool.query(
        'INSERT INTO questions (id, game_session_id, question_index, question_type, characters, time_limit) VALUES ($1, $2, $3, $4, $5, $6)',
        [uuidv4(), gameId, q.index, q.type, q.characters, q.timeLimit]
      );
    }
  }

  return questions.map((q) => ({
    index: q.index - 1, // Return 0-indexed
    type: q.type,
    characters: [q.characters],
    timeLimit: q.timeLimit,
  }));
}

/**
 * @route   POST /api/game/start
 * @desc    Start a new game session
 * @access  Admin only (or team for testing)
 */
router.post('/start', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    const { round } = req.body;

    const gameId = uuidv4();
    
    // Create game session
    await pool.query(
      'INSERT INTO game_sessions (id, status, round, current_question_index) VALUES ($1, $2, $3, $4)',
      [gameId, 'pending', round || 'preliminary', 0]
    );

    // Create sample questions
    const questions = await getOrCreateQuestions(gameId);

    // Store in memory
    activeSessions.set(gameId, {
      gameId,
      status: 'in_progress',
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      questions,
    });

    res.json({
      success: true,
      data: {
        gameId,
        status: 'in_progress',
        totalQuestions: questions.length,
        firstQuestion: questions[0],
      },
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ success: false, error: 'Failed to start game' });
  }
});

/**
 * @route   GET /api/game/current
 * @desc    Get current game state for a team
 * @access  Private (Team)
 */
router.get('/current', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    // Get the most recent game session that is not completed
    const result = await pool.query(
      `SELECT id, status, current_question_index, round 
       FROM game_sessions 
       WHERE status IN ('pending', 'in-progress', 'paused')
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No active game session',
      });
      return;
    }

    const session = result.rows[0];
    const gameId = session.id;

    // Get all questions for this game
    const questionsResult = await pool.query(
      `SELECT id, game_session_id, question_index, question_type, characters, time_limit
       FROM questions 
       WHERE game_session_id = $1
       ORDER BY question_index ASC`,
      [gameId]
    );

    const questions = questionsResult.rows.map((q) => ({
      index: q.question_index - 1,
      id: q.id,
      type: q.question_type,
      characters: [q.characters],
      timeLimit: q.time_limit,
    }));

    const currentQuestion = questions[session.current_question_index] || null;

    res.json({
      success: true,
      data: {
        gameId,
        status: session.status,
        currentQuestionIndex: session.current_question_index,
        totalQuestions: questions.length,
        currentQuestion,
      },
    });
  } catch (error) {
    console.error('Get current game error:', error);
    res.status(500).json({ success: false, error: 'Failed to get game state' });
  }
});

/**
 * @route   POST /api/game/pause
 * @desc    Pause current game
 * @access  Admin only
 */
router.post('/pause', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { gameId } = req.body;

    await pool.query(
      'UPDATE game_sessions SET status = $1 WHERE id = $2',
      ['paused', gameId]
    );

    const session = activeSessions.get(gameId);
    if (session) {
      session.status = 'paused';
    }

    res.json({ success: true, message: 'Game paused' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to pause game' });
  }
});

/**
 * @route   POST /api/game/stop
 * @desc    Stop current game and finalize scores
 * @access  Admin only
 */
router.post('/stop', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      res.status(400).json({
        success: false,
        error: 'Game ID is required',
      });
      return;
    }

    // Get final scores
    const scoresResult = await pool.query(`
      SELECT 
        t.id as team_id,
        t.team_name,
        COALESCE(SUM(a.score), 0) as score
      FROM teams t
      LEFT JOIN answers a ON t.id = a.team_id AND a.game_session_id = $1
      GROUP BY t.id, t.team_name
      ORDER BY score DESC
    `, [gameId]);

    const rankings = scoresResult.rows.map((row, index) => ({
      rank: index + 1,
      teamId: row.team_id,
      teamName: row.team_name,
      finalScore: row.score,
    }));

    // Store leaderboard
    await pool.query(
      'INSERT INTO leaderboards (id, session_id, final_rankings) VALUES ($1, $2, $3)',
      [uuidv4(), gameId, JSON.stringify(rankings)]
    );

    // Update game session status
    await pool.query(
      'UPDATE game_sessions SET status = $1 WHERE id = $2',
      ['ended', gameId]
    );

    // Remove from active sessions
    activeSessions.delete(gameId);

    res.json({
      success: true,
      message: 'Game stopped',
      finalRankings: rankings,
    });
  } catch (error) {
    console.error('Stop game error:', error);
    res.status(500).json({ success: false, error: 'Failed to stop game' });
  }
});

/**
 * @route   POST /api/game/advance
 * @desc    Advance to next question (called by team)
 * @access  Private (Team)
 */
router.post('/advance', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    const gameId = req.body.gameId;

    if (!gameId) {
      res.status(400).json({
        success: false,
        error: 'Missing gameId',
      });
      return;
    }

    // Get current game session
    const result = await pool.query(
      'SELECT id, current_question_index FROM game_sessions WHERE id = $1',
      [gameId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Game session not found',
      });
      return;
    }

    const session = result.rows[0];
    const nextIndex = session.current_question_index + 1;

    // Update the question index
    await pool.query(
      'UPDATE game_sessions SET current_question_index = $1 WHERE id = $2',
      [nextIndex, gameId]
    );

    // Return the new game state
    const currentResp = await pool.query(
      `SELECT id, status, current_question_index, round 
       FROM game_sessions 
       WHERE id = $1`,
      [gameId]
    );

    if (currentResp.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Game session not found' });
      return;
    }

    const newSession = currentResp.rows[0];

    // Get the next question
    const questionsResult = await pool.query(
      `SELECT id, game_session_id, question_index, question_type, characters, time_limit
       FROM questions 
       WHERE game_session_id = $1 AND question_index = $2`,
      [gameId, nextIndex + 1]
    );

    let nextQuestion = null;
    if (questionsResult.rows.length > 0) {
      const q = questionsResult.rows[0];
      nextQuestion = {
        index: q.question_index - 1,
        type: q.question_type,
        characters: [q.characters],
        timeLimit: q.time_limit,
      };
    }

    res.json({
      success: true,
      data: {
        gameId,
        currentQuestionIndex: nextIndex,
        nextQuestion,
      },
    });
  } catch (error) {
    console.error('Advance question error:', error);
    res.status(500).json({ success: false, error: 'Failed to advance question' });
  }
});

/**
 * @route   POST /api/game/next-question
 * @desc    Advance to next question
 * @access  Admin only
 */
router.post('/next-question', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { gameId } = req.body;

    const session = activeSessions.get(gameId);
    if (!session) {
      res.status(404).json({ success: false, error: 'Game session not found' });
      return;
    }

    if (session.currentQuestionIndex < session.totalQuestions - 1) {
      session.currentQuestionIndex++;

      await pool.query(
        'UPDATE game_sessions SET current_question_index = $1 WHERE id = $2',
        [session.currentQuestionIndex, gameId]
      );

      res.json({
        success: true,
        message: 'Advanced to next question',
        nextQuestion: session.questions[session.currentQuestionIndex],
      });
    } else {
      res.json({
        success: false,
        message: 'No more questions available',
      });
    }
  } catch (error) {
    console.error('Next question error:', error);
    res.status(500).json({ success: false, error: 'Failed to advance question' });
  }
});

/**
 * @route   GET /api/game/leaderboard
 * @desc    Get current leaderboard for the active game
 * @access  Private (Team)
 */
router.get('/leaderboard', verifyTeamAuth, async (req: Request, res: Response) => {
  try {
    // Get the most recent active game session
    const gameResult = await pool.query(
      `SELECT id FROM game_sessions 
       WHERE status IN ('pending', 'in-progress', 'paused')
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (gameResult.rows.length === 0) {
      res.json({
        success: true,
        data: {
          leaderboard: [],
        },
      });
      return;
    }

    const gameId = gameResult.rows[0].id;

    // Get current leaderboard with team scores
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
        gameId,
        leaderboard,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

export default router;
