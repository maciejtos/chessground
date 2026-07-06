'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, AvatarType } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';
import { getAIMove } from '@/lib/chessAI';
import { useTranslation } from '@/lib/i18n';
import { calculateMaterialAdvantage } from '@/lib/chessUtils';
import { TRexSVG } from './avatars/TRexAvatar';
import { ElephantSVG } from './avatars/ElephantAvatar';
import { CreeperSVG } from './avatars/CreeperAvatar';
import { NinjaSVG } from './avatars/NinjaAvatar';

interface ThemeConfig {
  lightSquare: string;
  darkSquare: string;
  accent: string;
}

// Vibrant, kid-friendly board themes!
const BOARD_THEMES: Record<AvatarType, ThemeConfig> = {
  trex: {
    lightSquare: '#dcfce7', // green-100
    darkSquare: '#22c55e',  // green-500
    accent: 'bg-green-500/30',
  },
  elephant: {
    lightSquare: '#fef9c3', // yellow-100
    darkSquare: '#eab308',  // yellow-500
    accent: 'bg-yellow-500/30',
  },
  creeper: {
    lightSquare: '#d9f99d', // lime-200
    darkSquare: '#65a30d',  // lime-600
    accent: 'bg-lime-500/30',
  },
  ninja: {
    lightSquare: '#fee2e2', // red-100
    darkSquare: '#ef4444',  // red-500
    accent: 'bg-red-500/30',
  },
};

export default function ChessBoard() {
  const { t } = useTranslation();
  const {
    fen,
    setFen,
    addMove,
    addCapture,
    setPlayerTurn,
    isPlayerTurn,
    setGameOver,
    gameOver,
    setLastEvent,
    difficulty,
    playerColor,
    audioUnlocked,
    resetGame,
    currentAvatar: rawAvatar,
    gameResult,
    popLastMoves,
    opponentName: rawOpponentName,
    capturedPieces,
  } = useGameStore();

  const gameRef = useRef(new Chess());
  const containerRef = useRef<HTMLDivElement>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [pendingPromotion, setPendingPromotion] = useState<{from: string, to: string} | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const currentAvatar = isMounted ? rawAvatar : ('trex' as AvatarType);
  const opponentName = isMounted ? rawOpponentName : 'Rex the Destroyer';

  const theme = BOARD_THEMES[currentAvatar] || BOARD_THEMES.trex;

  useEffect(() => {
    setIsMounted(true);
    const game = gameRef.current;
    if (!fen || fen.split(' ')[0] !== game.fen().split(' ')[0]) {
      game.load(fen);
    }
    setLastEvent('game-start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makeAIMove = useCallback(() => {
    if (gameOver) return;

    const game = gameRef.current;
    const aiMove = getAIMove(game.fen(), difficulty);

    if (!aiMove) return;

    if (!aiMove) return;

    aiTimeoutRef.current = setTimeout(() => {
      const result = game.move(aiMove.san);
      if (!result) return;

      const newFen = game.fen();
      setFen(newFen);
      addMove(result.san);

      if (game.isCheckmate()) {
        setLastEvent('loss');
        setGameOver(true, t('play.checkmate'));
        if (audioUnlocked) soundEngine.playCheckmate();
      } else if (game.isStalemate() || game.isDraw()) {
        setLastEvent('stalemate');
        setGameOver(true, t('play.draw'));
        if (audioUnlocked) soundEngine.playStalemate();
      } else if (game.isCheck()) {
        setLastEvent('check');
        if (audioUnlocked) soundEngine.playCheck();
      } else if (result.captured) {
        addCapture(playerColor, result.captured);
        setLastEvent('capture');
        if (audioUnlocked) soundEngine.playCapture();
      } else {
        setLastEvent('ai-move');
        if (audioUnlocked) soundEngine.playMove();
      }

      setPlayerTurn(true);
    }, 500 + Math.random() * 500);
  }, [gameOver, difficulty, setFen, addMove, setLastEvent, setGameOver, t, setPlayerTurn, addCapture, playerColor, audioUnlocked]);

  // Handle highlights for check
  const checkSquares = useMemo(() => {
    const game = gameRef.current;
    const squares: Record<string, React.CSSProperties> = {};
    if (game.isCheck()) {
      const board = game.board();
      for (const row of board) {
        for (const piece of row) {
          if (piece && piece.type === 'k' && piece.color === game.turn()) {
            squares[piece.square] = {
              background: 'radial-gradient(circle, rgba(239,68,68,0.8) 25%, transparent 25%)',
              boxShadow: 'inset 0 0 15px 5px rgba(239,68,68,0.5)',
              borderRadius: '8px'
            };
          }
        }
      }
    }
    return squares;
  }, [fen]);

  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  const processMove = useCallback((move: ReturnType<Chess['move']>, game: Chess) => {
    const newFen = game.fen();
    setFen(newFen);
    addMove(move.san);

    if (game.isCheckmate()) {
      setLastEvent('win');
      setGameOver(true, t('play.youWin'));
      if (audioUnlocked) soundEngine.playCheckmate();
    } else if (game.isStalemate() || game.isDraw()) {
      setLastEvent('stalemate');
      setGameOver(true, t('play.draw'));
      if (audioUnlocked) soundEngine.playStalemate();
    } else if (game.isCheck()) {
      setLastEvent('player-check');
      if (audioUnlocked) soundEngine.playCheck();
    } else if (move.captured) {
      const opponentColor = playerColor === 'white' ? 'black' : 'white';
      addCapture(opponentColor, move.captured);
      setLastEvent('player-capture');
      if (audioUnlocked) soundEngine.playCapture();
    } else {
      setLastEvent('player-move');
      if (audioUnlocked) soundEngine.playMove();
    }

    setPlayerTurn(false);

    if (!game.isGameOver()) {
      setTimeout(() => {
        setLastEvent('thinking');
      }, 300);
      makeAIMove();
    }
  }, [audioUnlocked, setFen, addMove, setGameOver, t, setLastEvent, playerColor, addCapture, setPlayerTurn, makeAIMove]);

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (gameOver || !isPlayerTurn || !targetSquare) return false;

      const game = gameRef.current;
      const moves = game.moves({ verbose: true });
      const isPromotion = moves.some((m) => m.from === sourceSquare && m.to === targetSquare && m.promotion);

      if (isPromotion) {
        setPendingPromotion({ from: sourceSquare, to: targetSquare });
        return false;
      }

      let move;
      try {
        move = game.move({ from: sourceSquare, to: targetSquare });
      } catch {
        return false;
      }
      if (!move) return false;

      setMoveFrom(null);
      setOptionSquares({});
      processMove(move, game);
      return true;
    },
    [gameOver, isPlayerTurn, processMove]
  );

  const onSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (gameOver || !isPlayerTurn) return;

      const game = gameRef.current;

      if (moveFrom) {
        const movesList = game.moves({ verbose: true });
        const isPromotion = movesList.some((m) => m.from === moveFrom && m.to === square && m.promotion);

        if (isPromotion) {
          setPendingPromotion({ from: moveFrom, to: square });
          setMoveFrom(null);
          setOptionSquares({});
          return;
        }

        let move;
        try {
          move = game.move({ from: moveFrom, to: square });
        } catch {
          // invalid move
        }

        if (move) {
          setMoveFrom(null);
          setOptionSquares({});
          processMove(move, game);
          return;
        }
      }

      const piece = game.get(square as import('chess.js').Square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);

        const moves = game.moves({ square: square as import('chess.js').Square, verbose: true });
        const newOptions: Record<string, React.CSSProperties> = {};

        // Highlight selected square with subtle color
        newOptions[square] = { background: 'rgba(255, 255, 255, 0.2)' };

        moves.forEach((m) => {
          if (game.get(m.to as import('chess.js').Square)) {
            // Capture highlight
            newOptions[m.to] = {
              background: 'radial-gradient(transparent 0%, transparent 75%, rgba(239, 68, 68, 0.7) 76%)',
              borderRadius: '50%',
            };
          } else {
            // Normal highlight
            newOptions[m.to] = {
              background: 'radial-gradient(circle, rgba(0,0,0,0.15) 25%, transparent 25%)',
              borderRadius: '50%'
            };
          }
        });
        setOptionSquares(newOptions);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    },
    [gameOver, isPlayerTurn, moveFrom, processMove]
  );

  const handleNewGame = useCallback(() => {
    gameRef.current = new Chess();
    resetGame();
  }, [resetGame]);

  const handleUndo = useCallback(() => {
    if (gameOver && gameResult !== t('play.checkmate') && gameResult !== t('play.youWin')) return; // Allow undoing checkmate
    
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    
    const game = gameRef.current;
    
    // Determine how many moves to undo
    // If it's not the player's turn (AI is thinking), undo 1 move (the player's).
    // If it is the player's turn, undo 2 moves (AI's and Player's).
    let movesToUndo = !isPlayerTurn ? 1 : 2;
    // Edge case: if we are at move 1, undoing 2 would fail
    if (game.history().length < movesToUndo) movesToUndo = game.history().length;
    if (movesToUndo === 0) return;

    const undoneCaptures: Array<{color: 'white'|'black', piece: string}> = [];
    
    for (let i = 0; i < movesToUndo; i++) {
      const move = game.undo();
      if (move && move.captured) {
        // Find which color lost the piece
        const capturedColor = move.color === 'w' ? 'black' : 'white';
        undoneCaptures.push({ color: capturedColor, piece: move.captured });
      }
    }

    setFen(game.fen());
    popLastMoves(movesToUndo, undoneCaptures);
    setPlayerTurn(true);
    setOptionSquares({});
    setMoveFrom(null);
    setLastEvent('game-start');
    if (gameOver) setGameOver(false, null);
  }, [gameOver, gameResult, isPlayerTurn, setFen, popLastMoves, setPlayerTurn, setLastEvent, setGameOver, t]);

  const handleResign = useCallback(() => {
    if (gameOver) return;
    setGameOver(true, t('play.resignLoss'));
    setLastEvent('loss');
  }, [gameOver, setGameOver, setLastEvent, t]);

  const handlePromotion = (piece: string) => {
    if (!pendingPromotion) return;
    const game = gameRef.current;
    let move;
    try {
      move = game.move({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
    } catch {
      setPendingPromotion(null);
      return;
    }
    setPendingPromotion(null);
    if (move) {
      processMove(move, game);
    }
  };

  useEffect(() => {
    window.addEventListener('trigger-undo', handleUndo);
    window.addEventListener('trigger-resign', handleResign);
    return () => {
      window.removeEventListener('trigger-undo', handleUndo);
      window.removeEventListener('trigger-resign', handleResign);
    };
  }, [handleUndo, handleResign]);

  const chessboardOptions = useMemo(() => ({
    position: fen,
    onPieceDrop: onDrop,
    onSquareClick: onSquareClick,
    animationDurationInMs: 250,
    boardStyle: {
      borderRadius: '8px',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
    },
    darkSquareStyle: {
      backgroundColor: theme.darkSquare,
    },
    lightSquareStyle: {
      backgroundColor: theme.lightSquare,
    },
    squareStyles: {
      ...checkSquares,
      ...optionSquares,
    },
  }), [fen, onDrop, onSquareClick, checkSquares, optionSquares, theme]);

  const getPieceIcon = (piece: string) => {
    switch (piece.toLowerCase()) {
      case 'p': return '♟';
      case 'n': return '♞';
      case 'b': return '♝';
      case 'r': return '♜';
      case 'q': return '♛';
      case 'k': return '♚';
      default: return '♟';
    }
  };

  const getAvatarIcon = (id: string) => {
    switch (id) {
      case 'trex': return <TRexSVG />;
      case 'elephant': return <ElephantSVG />;
      case 'creeper': return <CreeperSVG />;
      case 'ninja': return <NinjaSVG />;
      default: return <TRexSVG />;
    }
  };

  const renderPieces = (pieces: string[], colorCaptured: 'w' | 'b') => {
    return pieces.map((p, i) => (
      <span 
        key={i} 
        className={`text-lg sm:text-xl md:text-2xl -ml-2 sm:-ml-3 first:ml-0 relative ${
          colorCaptured === 'w' 
            ? 'text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)]' 
            : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
        }`}
        style={{ zIndex: i }}
      >
        {getPieceIcon(p)}
      </span>
    ));
  };

  const { whiteAdvantage, blackAdvantage } = calculateMaterialAdvantage(capturedPieces.white, capturedPieces.black);

  const opponentPieces = playerColor === 'white' ? capturedPieces.white : capturedPieces.black;
  const opponentColorChar = playerColor === 'white' ? 'w' : 'b';
  const opponentAdvantage = playerColor === 'white' ? blackAdvantage : whiteAdvantage;

  const playerPieces = playerColor === 'white' ? capturedPieces.black : capturedPieces.white;
  const playerColorChar = playerColor === 'white' ? 'b' : 'w';
  const playerAdvantage = playerColor === 'white' ? whiteAdvantage : blackAdvantage;

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row items-center md:items-stretch justify-center w-full relative gap-2 md:gap-6">
      
      {/* Left Sidebar: Headers (Above on mobile, Left on desktop) */}
      <div className="flex flex-row md:flex-col justify-between w-full max-w-[650px] md:w-[220px] gap-2 md:py-2 flex-shrink-0">
        
        {/* Opponent Header */}
        <div className="flex-1 md:flex-none flex flex-col items-start justify-center px-3 py-2 bg-black/20 backdrop-blur-sm rounded-xl shadow-sm border-2 border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/50 flex items-center justify-center font-bold overflow-hidden shadow-inner p-1">
              {getAvatarIcon(currentAvatar)}
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-xs md:text-sm drop-shadow-md">{opponentName}</span>
          </div>
          <div className="flex items-center min-h-[24px] gap-2 bg-black/10 px-2 py-1.5 rounded-lg w-full flex-wrap">
            <div className="flex">{renderPieces(opponentPieces, opponentColorChar)}</div>
            {opponentAdvantage > 0 && <span className="text-white/90 text-xs font-bold leading-none">+{opponentAdvantage}</span>}
          </div>
        </div>

        {/* Spacer for desktop to push player header to bottom */}
        <div className="hidden md:block flex-1" />

        {/* Player Header */}
        <div className="flex-1 md:flex-none flex flex-col items-start justify-center px-3 py-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-md border-2 border-white/80">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
              <span className="text-sm md:text-lg">👤</span>
            </div>
            <span className="text-blue-800 font-black tracking-widest uppercase text-xs md:text-sm">{t('play.you')}</span>
          </div>
          <div className="flex items-center min-h-[24px] gap-2 bg-white/40 px-2 py-1.5 rounded-lg w-full flex-wrap shadow-inner">
            <div className="flex">{renderPieces(playerPieces, playerColorChar)}</div>
            {playerAdvantage > 0 && <span className="text-blue-600 text-xs font-bold leading-none">+{playerAdvantage}</span>}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative w-full max-w-[650px] border-[10px] border-white rounded-[1.5rem] shadow-2xl overflow-hidden bg-white p-1 box-content flex-shrink-0">
        {isMounted ? (
          <Chessboard options={chessboardOptions} />
        ) : (
          <div className="w-full aspect-square bg-blue-50 animate-pulse rounded-xl" />
        )}
      </div>

      {/* Promotion Dialog */}
      <AnimatePresence>
        {pendingPromotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 rounded-[2rem]"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white border-8 border-blue-200 p-6 rounded-3xl flex flex-col items-center shadow-2xl"
            >
              <h3 className="text-blue-900 font-black text-xl mb-4 uppercase tracking-wider">{t('play.choosePiece')}</h3>
              <div className="flex gap-4">
                {['q', 'r', 'b', 'n'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePromotion(p)}
                    className="w-16 h-16 bg-blue-50 border-4 border-blue-200 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    <img src={`/pieces/${playerColor === 'white' ? 'w' : 'b'}${p.toUpperCase()}.svg`} alt={p} className="w-12 h-12" />
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPendingPromotion(null)}
                className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600"
              >
                {t('play.cancel')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-lg z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
              className="relative w-full max-w-sm flex flex-col items-center bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-4 mt-16 pb-8 pt-20 px-6"
              style={{ borderColor: theme.darkSquare }}
            >
              <div className="absolute -top-24 w-40 h-40 flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                 <div className="transform scale-110">
                   {getAvatarIcon(currentAvatar)}
                 </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-center mt-2 mb-2" style={{ color: theme.darkSquare }}>
                {t('play.gameOver')}
              </h2>
              
              <div className="text-base sm:text-lg font-bold text-gray-600 text-center mb-8 px-6 py-3 bg-gray-100/80 rounded-2xl border-2 border-gray-200">
                {gameResult}
              </div>
              
              <button
                onClick={handleNewGame}
                className="w-full py-4 text-white font-black text-xl tracking-widest uppercase rounded-2xl transition-transform active:scale-95 shadow-xl border-b-4 border-black/20"
                style={{ backgroundColor: theme.darkSquare }}
              >
                {t('play.newGame')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
