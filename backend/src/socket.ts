import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { SOCKET_EVENTS } from '@cyber-etymology/shared';

interface SocketUser {
  id: string;
  teamId: string;
  teamName: string;
  role: 'team' | 'admin';
}

const connectedUsers = new Map<string, SocketUser>();
const teamRooms = new Map<string, Set<string>>();
const gameState: {
  isActive: boolean;
  currentQuestion: null | { characters: string[]; type: string; timeLimit: number };
  timer: number;
} = {
  isActive: false,
  currentQuestion: null,
  timer: 0,
};

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join team event
    socket.on(SOCKET_EVENTS.JOIN_TEAM, (data: any) => {
      try {
        const { teamId, teamName, userId, role } = data;

        const user: SocketUser = {
          id: userId,
          teamId,
          teamName,
          role: role || 'team',
        };

        connectedUsers.set(socket.id, user);

        // Add to team room
        const roomName = `team:${teamId}`;
        socket.join(roomName);

        if (!teamRooms.has(roomName)) {
          teamRooms.set(roomName, new Set());
        }
        teamRooms.get(roomName)!.add(socket.id);

        // Also join admin room if admin
        if (role === 'admin') {
          socket.join('admin');
        }

        console.log(`[Socket] ${teamName} joined room ${roomName}`);
        io.emit('team-joined', { teamName, userId });
      } catch (error) {
        console.error('Error joining team:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join team' });
      }
    });

    // Submit answer event
    socket.on(SOCKET_EVENTS.SUBMIT_ANSWER, (data: any) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'User not found' });
          return;
        }

        const { questionId, word, timeTaken } = data;

        // Emit to all clients (for live monitoring)
        io.emit('answer-submitted', {
          teamId: user.teamId,
          teamName: user.teamName,
          questionId,
          word,
          timeTaken,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to submit answer' });
      }
    });

    // Skip question event
    socket.on(SOCKET_EVENTS.SKIP_QUESTION, (data: any) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'User not found' });
          return;
        }

        const { questionId } = data;

        io.emit('question-skipped', {
          teamId: user.teamId,
          teamName: user.teamName,
          questionId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error skipping question:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to skip question' });
      }
    });

    // Admin: Release question
    socket.on('admin:release-question', (data: any) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user || user.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized' });
          return;
        }

        const { questionIndex, characters, type, timeLimit } = data;

        io.emit(SOCKET_EVENTS.QUESTION_RELEASED, {
          questionIndex,
          characters,
          type,
          timeLimit,
          releasedAt: new Date(),
        });

        gameState.currentQuestion = { characters, type, timeLimit };
        gameState.timer = timeLimit;
      } catch (error) {
        console.error('Error releasing question:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to release question' });
      }
    });

    // Admin: Start timer
    socket.on('admin:start-timer', () => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user || user.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized' });
          return;
        }

        io.emit(SOCKET_EVENTS.TIMER_START, {
          timeLimit: gameState.timer,
          startedAt: new Date(),
        });
      } catch (error) {
        console.error('Error starting timer:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to start timer' });
      }
    });

    // Broadcast timer updates
    socket.on('admin:timer-update', (data: any) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user || user.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized' });
          return;
        }

        const { remainingTime } = data;
        gameState.timer = remainingTime;

        io.emit(SOCKET_EVENTS.TIMER_UPDATE, {
          remainingTime,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating timer:', error);
      }
    });

    // Leaderboard update
    socket.on('admin:update-leaderboard', (data: any) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user || user.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized' });
          return;
        }

        io.emit(SOCKET_EVENTS.LEADERBOARD_UPDATE, {
          standings: data.standings,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to update leaderboard' });
      }
    });

    // Game status update
    socket.on('admin:game-status', (data: any) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user || user.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized' });
          return;
        }

        const { status } = data;
        gameState.isActive = status === 'in-progress';

        io.emit(SOCKET_EVENTS.GAME_STATUS, {
          status,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating game status:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to update game status' });
      }
    });

    // Disconnect handler
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`[Socket] ${user.teamName} disconnected`);
        connectedUsers.delete(socket.id);

        // Remove from team room
        const roomName = `team:${user.teamId}`;
        const room = teamRooms.get(roomName);
        if (room) {
          room.delete(socket.id);
          if (room.size === 0) {
            teamRooms.delete(roomName);
          }
        }

        io.emit('team-disconnected', { teamName: user.teamName });
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`[Socket Error] ${socket.id}:`, error);
    });
  });

  console.log('[Socket.IO] Initialized');
  return io;
}
