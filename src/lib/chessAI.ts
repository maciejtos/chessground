/**
 * Chess AI with configurable difficulty (1-5).
 * Uses chess.js for move generation and evaluation.
 */
import { Chess, Move } from 'chess.js';

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/** Evaluate a board position (positive = white advantage) */
function evaluate(game: Chess): number {
  const board = game.board();
  let score = 0;

  for (const row of board) {
    for (const square of row) {
      if (square) {
        const value = PIECE_VALUES[square.type] || 0;
        score += square.color === 'w' ? value : -value;
      }
    }
  }

  // Small bonus for center control
  const centerSquares = ['d4', 'd5', 'e4', 'e5'] as const;
  for (const sq of centerSquares) {
    const piece = game.get(sq);
    if (piece) {
      score += piece.color === 'w' ? 0.1 : -0.1;
    }
  }

  return score;
}

/** Pick the best move for difficulty level 1 (random) */
function pickRandom(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

/** Pick move for difficulty 2-3 (prefer captures / checks) */
function pickHeuristic(game: Chess, moves: Move[]): Move {
  // Prioritize checkmate moves
  for (const move of moves) {
    const testGame = new Chess(game.fen());
    testGame.move(move.san);
    if (testGame.isCheckmate()) return move;
  }

  // Prioritize checks
  const checks = moves.filter((m) => {
    const testGame = new Chess(game.fen());
    testGame.move(m.san);
    return testGame.isCheck();
  });
  if (checks.length > 0 && Math.random() > 0.3) {
    return checks[Math.floor(Math.random() * checks.length)];
  }

  // Prioritize captures (higher value captures first)
  const captures = moves
    .filter((m) => m.captured)
    .sort((a, b) => {
      const aVal = PIECE_VALUES[a.captured!] || 0;
      const bVal = PIECE_VALUES[b.captured!] || 0;
      return bVal - aVal;
    });
  if (captures.length > 0 && Math.random() > 0.2) {
    return captures[0];
  }

  return pickRandom(moves);
}

/** Pick move for difficulty 4-5 (minimax with limited depth) */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluate(game);
  }

  const moves = game.moves({ verbose: true });

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move.san);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move.san);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function pickMinimax(game: Chess, moves: Move[], depth: number): Move {
  const isWhite = game.turn() === 'w';
  let bestMove = moves[0];
  let bestEval = isWhite ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move.san);
    const evalScore = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite ? evalScore > bestEval : evalScore < bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }

  // Add some randomness for non-max difficulty
  if (depth < 3 && Math.random() < 0.15) {
    return pickRandom(moves);
  }

  return bestMove;
}

/**
 * Get the AI's move for the given position and difficulty.
 * @param fen Current board position
 * @param difficulty 1-5 (1 = random, 5 = minimax depth 3)
 * @returns The chosen move, or null if no moves
 */
export function getAIMove(fen: string, difficulty: number): Move | null {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) return null;

  switch (difficulty) {
    case 1:
      return pickRandom(moves);
    case 2:
      return pickHeuristic(game, moves);
    case 3:
      return pickHeuristic(game, moves);
    case 4:
      return pickMinimax(game, moves, 2);
    case 5:
      return pickMinimax(game, moves, 3);
    default:
      return pickRandom(moves);
  }
}
