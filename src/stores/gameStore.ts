import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AvatarType = 'trex' | 'elephant' | 'creeper' | 'ninja';
export type GameEvent =
  | 'game-start'
  | 'thinking'
  | 'player-move'
  | 'ai-move'
  | 'move'
  | 'capture'
  | 'check'
  | 'checkmate'
  | 'blunder'
  | 'stalemate'
  | 'player-capture'
  | 'player-check'
  | 'player-checkmate'
  | 'win'
  | 'loss'
  | null;

export interface CapturedPieces {
  white: string[];
  black: string[];
}

export interface GameState {
  // Board state
  fen: string;
  moveHistory: string[];
  capturedPieces: CapturedPieces;
  isPlayerTurn: boolean;
  gameOver: boolean;
  gameResult: string | null;

  // Game config
  currentAvatar: AvatarType;
  opponentName: string;
  difficulty: number; // 1-5
  playerColor: 'white' | 'black';

  // Events (drives avatar reactions)
  lastEvent: GameEvent;
  lastEventTimestamp: number;

  // Audio
  audioUnlocked: boolean;

  // Speech bubble
  speechText: string;
  showSpeechBubble: boolean;

  // Actions
  setFen: (fen: string) => void;
  addMove: (move: string) => void;
  addCapture: (color: 'white' | 'black', piece: string) => void;
  setPlayerTurn: (isPlayerTurn: boolean) => void;
  setGameOver: (gameOver: boolean, result?: string | null) => void;
  setAvatar: (avatar: AvatarType) => void;
  setOpponentName: (name: string) => void;
  setDifficulty: (level: number) => void;
  setLastEvent: (event: GameEvent) => void;
  unlockAudio: () => void;
  setSpeech: (text: string) => void;
  hideSpeech: () => void;
  resetGame: () => void;
  popLastMoves: (count: number, undoneCaptures: Array<{color: 'white' | 'black', piece: string}>) => void;
}

const initialState = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  isPlayerTurn: true,
  gameOver: false,
  gameResult: null,
  currentAvatar: 'trex' as AvatarType,
  opponentName: 'Rex the Destroyer',
  difficulty: 1,
  playerColor: 'white' as const,
  lastEvent: null as GameEvent,
  lastEventTimestamp: 0,
  audioUnlocked: false,
  speechText: '',
  showSpeechBubble: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setFen: (fen) => set({ fen }),
      addMove: (move) =>
        set((s) => ({ moveHistory: [...s.moveHistory, move] })),
      addCapture: (color, piece) =>
        set((s) => ({
          capturedPieces: {
            ...s.capturedPieces,
            [color]: [...s.capturedPieces[color], piece],
          },
        })),
      popLastMoves: (count, undoneCaptures) =>
        set((s) => {
          const newHistory = s.moveHistory.slice(0, Math.max(0, s.moveHistory.length - count));
          const newCaptured = { white: [...s.capturedPieces.white], black: [...s.capturedPieces.black] };
          
          undoneCaptures.forEach(({ color, piece }) => {
            const idx = newCaptured[color].lastIndexOf(piece);
            if (idx !== -1) newCaptured[color].splice(idx, 1);
          });
          
          return {
            moveHistory: newHistory,
            capturedPieces: newCaptured,
            gameOver: false,
            gameResult: null,
          };
        }),
      setPlayerTurn: (isPlayerTurn) => set({ isPlayerTurn }),
      setGameOver: (gameOver, result = null) => set({ gameOver, gameResult: result }),
      setAvatar: (avatar) => set({ currentAvatar: avatar }),
      setOpponentName: (name) => set({ opponentName: name }),
      setDifficulty: (level) => set({ difficulty: level }),
      setLastEvent: (event) =>
        set({ lastEvent: event, lastEventTimestamp: Date.now() }),
      unlockAudio: () => set({ audioUnlocked: true }),
      setSpeech: (text) => set({ speechText: text, showSpeechBubble: true }),
      hideSpeech: () => set({ showSpeechBubble: false, speechText: '' }),
      resetGame: () => set((s) => ({
        ...initialState,
        currentAvatar: s.currentAvatar,
        opponentName: s.opponentName,
        difficulty: s.difficulty,
        playerColor: s.playerColor,
        audioUnlocked: true,
        lastEvent: 'game-start',
        lastEventTimestamp: Date.now()
      })),
    }),
    {
      name: 'chessground-storage',
      partialize: (state) => ({
        currentAvatar: state.currentAvatar,
        opponentName: state.opponentName,
        difficulty: state.difficulty,
        audioUnlocked: state.audioUnlocked,
        // We only persist preferences to fix the avatar reset issue, not the active game state to avoid stale games
      }),
    }
  )
);
