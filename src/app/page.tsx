'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundEngine } from '@/lib/soundEngine';
import { useGameStore } from '@/stores/gameStore';
import { useTranslation } from '@/lib/i18n';

export default function LobbyPage() {
  const router = useRouter();
  const unlockAudio = useGameStore((s) => s.unlockAudio);
  const { t } = useTranslation();
  
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = async () => {
    await soundEngine.unlock();
    unlockAudio();
    soundEngine.playMove();
    router.push('/select');
  };

  return (
    <div className="flex-1 w-full h-full relative flex flex-col items-center justify-center overflow-hidden p-4">
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 sm:gap-8 text-center w-full max-w-3xl mx-auto flex-1 min-h-0 bg-white/40 backdrop-blur-md p-8 sm:p-12 rounded-[3rem] border-8 border-white/60 shadow-2xl">
        
        {/* Playful Icon */}
        <motion.div
          animate={{ rotate: isHovered ? [0, -15, 15, -15, 15, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 sm:w-32 sm:h-32 mb-2 bg-yellow-400 rounded-full flex items-center justify-center border-8 border-yellow-500 shadow-[0_10px_0_rgb(202,138,4)] relative"
        >
          <span className="text-5xl sm:text-7xl text-white drop-shadow-md">👑</span>
        </motion.div>

        {/* Bubbly Title */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black text-blue-900 tracking-tight"
          style={{ textShadow: '0 4px 0 rgba(255,255,255,0.8)' }}
        >
          {t('lobby.title')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-700 text-lg sm:text-xl lg:text-2xl font-bold max-w-xl"
        >
          {t('lobby.subtitle')}
        </motion.p>

        {/* Massive Play Button */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.5 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={handlePlay}
          className="mt-4 sm:mt-6 btn-primary-massive px-12 py-4 sm:px-16 sm:py-5 flex items-center gap-4 group"
        >
          <span className="text-2xl sm:text-3xl drop-shadow-md">
            {t('lobby.playNow')}
          </span>
          <motion.span
            animate={{ x: isHovered ? [0, 10, 0] : 0 }}
            transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
            className="text-3xl"
          >
            🚀
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
