'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useTranslation } from '@/lib/i18n';

export default function GameInfo() {
  const { t } = useTranslation();
  const moves = useGameStore((s) => s.moveHistory);
  const whiteCaptures = useGameStore((s) => s.capturedPieces.white);
  const blackCaptures = useGameStore((s) => s.capturedPieces.black);
  const opponentName = useGameStore((s) => s.opponentName);
  const playerColor = useGameStore((s) => s.playerColor);

  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || '',
    });
  }
  const reversedPairs = [...movePairs].reverse();

  const renderPieces = (pieces: string[], colorCaptured: 'w' | 'b') => {
    return pieces.map((p, i) => (
      <img 
        key={i} 
        src={`/pieces/${colorCaptured}${p.toUpperCase()}.svg`} 
        alt={p} 
        className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md -ml-2 sm:-ml-3 first:ml-0 relative transition-transform hover:-translate-y-1" 
        style={{ zIndex: i }}
      />
    ));
  };

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-md rounded-[2rem] border-4 border-white shadow-xl min-h-0 overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 bg-blue-100 flex items-center justify-center shrink-0 border-b-2 border-white/50 shadow-sm z-10">
        <h3 className="text-blue-800 font-black uppercase tracking-widest text-[10px] sm:text-xs">
          {t('play.moveHistory')}
        </h3>
      </div>

      {/* Move History */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-blue-50/20 scrollbar-thin flex flex-col relative z-0">
        <div className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {reversedPairs.map((pair, idx) => (
              <motion.div
                key={pair.moveNumber}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  idx === 0 
                    ? 'bg-blue-500 text-white shadow-md transform scale-[1.02] z-10' 
                    : 'bg-white text-gray-700 border border-gray-100 shadow-sm'
                }`}
              >
                <div className={`w-8 font-black text-right pr-2 border-r border-white/20 ${idx === 0 ? 'text-blue-200' : 'text-gray-400 border-gray-200'}`}>
                  {pair.moveNumber}.
                </div>
                <div className="flex-1 text-center font-mono text-sm sm:text-base cursor-pointer hover:opacity-80">{pair.white}</div>
                <div className="flex-1 text-center font-mono text-sm sm:text-base cursor-pointer hover:opacity-80">{pair.black}</div>
              </motion.div>
            ))}
            
            {moves.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-gray-400 opacity-60">
                <span className="text-4xl mb-2">🏁</span>
                <span className="font-bold italic text-sm">{t('play.readyToPlay')}</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 shrink-0 border-t-2 border-gray-100 p-2 sm:p-3">
        <div className="flex gap-2 w-full">
          {/* Resign Button */}
          <button
            onClick={() => window.dispatchEvent(new Event('trigger-resign'))}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-bold p-2 rounded-xl transition-colors active:scale-95 shadow-sm"
            title={t('play.resign')}
          >
            <span className="text-xl sm:text-2xl leading-none">🏳️</span>
          </button>

          {/* Undo Button */}
          <button
            onClick={() => window.dispatchEvent(new Event('trigger-undo'))}
            className="flex-[2] flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-300 text-yellow-800 font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
            title={t('play.undoMove')}
          >
            <span className="text-lg sm:text-xl leading-none -mt-1">↩</span>
            <span className="uppercase tracking-widest text-xs sm:text-sm">{t('play.undo')}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
