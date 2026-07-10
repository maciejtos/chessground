'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore, AvatarType } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';
import { useTranslation } from '@/lib/i18n';

import TRexAvatar from '@/components/avatars/TRexAvatar';
import ElephantAvatar from '@/components/avatars/ElephantAvatar';
import CreeperAvatar from '@/components/avatars/CreeperAvatar';
import NinjaAvatar from '@/components/avatars/NinjaAvatar';
import BatmanAvatar from '@/components/avatars/BatmanAvatar';

type OpponentOption = {
  id: AvatarType;
  nameKey: string;
  descKey: string;
  colorClass: string;
  shadowClass: string;
  sound: () => void;
  avatar: React.ReactNode;
};

const OPPONENTS: OpponentOption[] = [
  {
    id: 'trex',
    nameKey: 'opponent.trex.name',
    descKey: 'opponent.trex.desc',
    colorClass: 'bg-green-100 border-green-500 text-green-900',
    shadowClass: 'shadow-[0_8px_0_rgb(34,197,94)]', // green-500
    sound: () => soundEngine.roar(),
    avatar: <TRexAvatar preview />,
  },
  {
    id: 'elephant',
    nameKey: 'opponent.elephant.name',
    descKey: 'opponent.elephant.desc',
    colorClass: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    shadowClass: 'shadow-[0_8px_0_rgb(234,179,8)]', // yellow-500
    sound: () => soundEngine.trumpet(),
    avatar: <ElephantAvatar preview />,
  },
  {
    id: 'creeper',
    nameKey: 'opponent.creeper.name',
    descKey: 'opponent.creeper.desc',
    colorClass: 'bg-lime-100 border-lime-600 text-lime-900',
    shadowClass: 'shadow-[0_8px_0_rgb(101,163,13)]', // lime-600
    sound: () => soundEngine.hiss(),
    avatar: <CreeperAvatar preview />,
  },
  {
    id: 'ninja',
    nameKey: 'opponent.ninja.name',
    descKey: 'opponent.ninja.desc',
    colorClass: 'bg-red-100 border-red-500 text-red-900',
    shadowClass: 'shadow-[0_8px_0_rgb(239,68,68)]', // red-500
    sound: () => soundEngine.ninjaKatanaDraw(),
    avatar: <NinjaAvatar preview />,
  },
  {
    id: 'batman',
    nameKey: 'opponent.batman.name',
    descKey: 'opponent.batman.desc',
    colorClass: 'bg-slate-800 border-slate-950 text-white',
    shadowClass: 'shadow-[0_8px_0_rgb(15,23,42)]', // slate-900
    sound: () => soundEngine.playBatSignal(),
    avatar: <BatmanAvatar preview />,
  },
];

const DIFFICULTY_LEVELS = [
  { level: 1, labelKey: 'diff.1', color: 'bg-green-400' },
  { level: 2, labelKey: 'diff.2', color: 'bg-lime-400' },
  { level: 3, labelKey: 'diff.3', color: 'bg-yellow-400' },
  { level: 4, labelKey: 'diff.4', color: 'bg-orange-400' },
  { level: 5, labelKey: 'diff.5', color: 'bg-red-500 text-white' },
];

function OpponentCard({ opponent, isSelected, onClick, t, isStarting }: { opponent: OpponentOption; isSelected: boolean; onClick: () => void; t: (key: string) => string; isStarting?: boolean }) {
  return (
    <motion.button
      whileHover={!isStarting ? { y: -5 } : {}}
      whileTap={!isStarting ? { scale: 0.95, y: 0 } : {}}
      onClick={onClick}
      disabled={isStarting}
      className={`relative w-full h-full flex items-center justify-center p-4 rounded-[2rem] border-4 transition-all duration-300 text-center overflow-hidden ${isSelected
          ? `${opponent.colorClass} ${opponent.shadowClass} scale-105 z-10 border-[6px]`
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-[0_4px_0_rgb(229,231,235)]'
        }`}
    >
      {/* Avatar Container - Dims when selected */}
      <div className={`relative z-10 flex items-center justify-center w-full h-full transition-opacity duration-500 ${isSelected ? 'opacity-30' : 'opacity-100'}`}>
        <div className="transform scale-[0.8] sm:scale-100 transition-transform duration-300 flex items-center justify-center">
          {opponent.avatar}
        </div>
      </div>

      {/* Name appears in center when selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-2"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] px-2 text-center" style={{ textShadow: '0 4px 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,1)' }}>
              {t(opponent.nameKey)}
            </h3>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 w-10 h-10 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-lg font-bold">✓</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function SelectPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const setAvatar = useGameStore((s) => s.setAvatar);
  const setOpponentName = useGameStore((s) => s.setOpponentName);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const resetGame = useGameStore((s) => s.resetGame);

  const [selectedId, setSelectedId] = useState<AvatarType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    if (!selectedId) return;
    setIsStarting(true);
    soundEngine.playMove();

    const opponent = OPPONENTS.find((o) => o.id === selectedId)!;
    setAvatar(selectedId);
    setOpponentName(t(opponent.nameKey));
    setDifficulty(selectedDifficulty);
    resetGame();

    setTimeout(() => {
      router.push('/play');
    }, 1200);
  };

  const selectedOpponent = OPPONENTS.find(o => o.id === selectedId);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center lg:justify-center p-4 min-h-0 bg-sky-100 overflow-y-auto lg:overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl h-auto lg:h-full lg:max-h-[700px] gap-6 lg:gap-10 items-center justify-center py-6 lg:py-0">

        {/* Left Side: Info & Controls */}
        <motion.div
          animate={{ x: isStarting ? -300 : 0, opacity: isStarting ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left w-full max-w-md z-10"
        >
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 w-full">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-blue-900 tracking-tight mb-2" style={{ textShadow: '0 2px 0 rgba(255,255,255,1)' }}>
              {t('select.title')}
            </h1>
            <p className="text-blue-700 font-bold text-sm sm:text-base">
              {t('select.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white p-6 sm:p-8 rounded-[2rem] border-4 border-blue-200 shadow-[0_8px_0_rgb(191,219,254)] flex flex-col gap-6 relative"
          >
            {/* Display Selected Character Info */}
            <div className="min-h-[80px] bg-blue-50 rounded-2xl p-4 border-2 border-blue-100 flex items-center justify-center">
              {selectedOpponent ? (
                <p className="text-blue-900 font-bold text-sm leading-relaxed text-center">
                  &quot;{t(selectedOpponent.descKey)}&quot;
                </p>
              ) : (
                <p className="text-blue-400 font-bold text-center animate-pulse">
                  {t('select.selectOpponent')}
                </p>
              )}
            </div>

            <div className="w-full">
              <h3 className="text-blue-900 font-black mb-3 text-lg">{t('select.diffLabel')}</h3>
              <div className="flex gap-2 w-full">
                {DIFFICULTY_LEVELS.map((diff) => {
                  const isActive = selectedDifficulty === diff.level;
                  return (
                    <button
                      key={diff.level}
                      onClick={() => {
                        soundEngine.playMove();
                        setSelectedDifficulty(diff.level);
                      }}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 border-b-4 ${isActive
                          ? `${diff.color} border-black/20 shadow-inner scale-105`
                          : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                      <span className="text-sm">{diff.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.button
              whileTap={!isStarting ? { scale: 0.95 } : {}}
              onClick={handleStart}
              disabled={!selectedId || isStarting}
              className={`relative overflow-hidden w-full py-4 text-xl sm:text-2xl mt-2 ${!selectedId ? 'bg-gray-300 border-b-4 border-gray-400 text-gray-500 rounded-3xl font-bold' : isStarting ? 'bg-blue-600 text-white rounded-3xl font-bold border-none shadow-[0_0_40px_rgba(59,130,246,0.8)]' : 'btn-primary-massive'}`}
            >
              {isStarting ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-2xl">⏳</motion.div>
                  <span className="animate-pulse">{t('select.preparing')}</span>
                </div>
              ) : t('select.startGame')}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Side: Opponent Grid */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none h-full flex flex-col justify-center min-h-0 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-4 sm:gap-6 w-full h-auto min-h-[450px] sm:min-h-[500px] p-2">
            {OPPONENTS.map((opponent, index) => {
              const isSelected = selectedId === opponent.id;

              // dramatic animation values when starting
              const variants = {
                normal: { opacity: 1, scale: 1, x: 0, y: 0 },
                startingSelected: { opacity: 1, scale: 1.15, zIndex: 50, filter: 'brightness(1.1)' },
                startingUnselected: { opacity: 0, scale: 0.95, filter: 'blur(4px)' }
              };

              return (
                <motion.div
                  key={opponent.id}
                  animate={isStarting ? (isSelected ? 'startingSelected' : 'startingUnselected') : 'normal'}
                  variants={variants}
                  transition={{ duration: isStarting ? 0.6 : 0.4, ease: "easeInOut" }}
                  className="h-full w-full"
                  style={{ originX: 0.5, originY: 0.5 }}
                >
                  <OpponentCard
                    opponent={opponent}
                    isSelected={isSelected}
                    onClick={() => {
                      if (isStarting) return;
                      setSelectedId(opponent.id);
                      opponent.sound();
                    }}
                    t={t}
                    isStarting={isStarting}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Cinematic Start Game Overlay */}
      <AnimatePresence>
        {isStarting && selectedOpponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${selectedOpponent.colorClass.replace('bg-', 'bg-').split(' ')[0]}`}
            style={{ backgroundColor: selectedOpponent.colorClass.includes('green') ? '#dcfce7' : selectedOpponent.colorClass.includes('yellow') ? '#fef9c3' : selectedOpponent.colorClass.includes('lime') ? '#ecfccb' : selectedOpponent.id === 'batman' ? '#0f172a' : '#fee2e2' }}
          >
            <motion.div
              initial={{ scale: 0.1, y: -500, rotate: -45 }}
              animate={{ scale: 1.8, y: -40, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
              className="w-64 h-64 flex items-center justify-center drop-shadow-2xl"
            >
              {selectedOpponent.avatar}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
              className="absolute bottom-1/4 flex flex-col items-center"
            >
              <h2 className="text-4xl sm:text-6xl font-black text-gray-800 tracking-widest uppercase mb-4" style={{ textShadow: '0 4px 0 rgba(255,255,255,1)' }}>
                {t('play.vs')} {t(selectedOpponent.nameKey)}
              </h2>
              <div className="flex items-center gap-3 bg-white/80 px-6 py-3 rounded-full border-4 border-white shadow-lg">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-3xl">⏳</motion.div>
                <span className="text-2xl font-bold text-gray-700 uppercase tracking-widest">{t('select.preparing')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
