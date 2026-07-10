'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';
import AvatarWrapper from '@/components/avatars/AvatarWrapper';
import GameInfo from '@/components/GameInfo';
import { useGameStore, AvatarType } from '@/stores/gameStore';
import { useTranslation } from '@/lib/i18n';

const THEMES: Record<AvatarType, string> = {
  trex: 'bg-green-100',
  elephant: 'bg-yellow-100',
  creeper: 'bg-lime-100',
  ninja: 'bg-red-100',
  batman: 'bg-slate-900 text-slate-100',
};

export default function PlayPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const currentAvatar = useGameStore((s) => s.currentAvatar);
  const opponentName = useGameStore((s) => s.opponentName);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeAvatar = mounted ? currentAvatar : 'trex';
  const themeClass = THEMES[activeAvatar] || THEMES.trex;

  return (
    <div className={`flex-1 w-full h-full flex flex-col relative overflow-y-auto lg:overflow-hidden transition-colors duration-1000 p-2 sm:p-4 min-h-0 ${themeClass}`}>

      {/* Main content - Horizontal Layout to fit exactly into screen */}
      <main className="flex-none lg:flex-1 min-h-0 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4 lg:gap-8 relative z-10 w-full max-w-7xl mx-auto pb-2 py-4 lg:py-0">

        {/* Center: Chessboard - Strictly bounded by available height on desktop, auto on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="flex-none lg:flex-1 w-full h-auto lg:h-full lg:max-h-full min-h-0 flex justify-center items-center relative"
        >
          <div className="relative w-full h-auto lg:h-full lg:max-h-[85vh] flex justify-center items-center">
            {/* Guarantee it never stretches beyond height bounds in flexbox on desktop */}
            <div className="w-full h-auto lg:h-full flex justify-center items-center max-w-full lg:max-w-[calc(100vh-120px)]">
              <ChessBoard />
            </div>
          </div>
        </motion.div>

        {/* Right side: Avatar + GameInfo */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full lg:w-[320px] xl:w-[360px] flex flex-col items-stretch gap-4 shrink-0 h-auto lg:h-full lg:max-h-full min-h-0"
        >
          {/* Avatar Container */}
          <div className="hidden lg:flex relative w-full aspect-square max-h-[450px] rounded-[2rem] border-[10px] border-white bg-white/40 shadow-2xl items-center justify-center p-8 shrink-0 mx-auto transition-all duration-500">
            <div className="w-full h-full flex items-center justify-center relative z-10">
              <AvatarWrapper />
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col min-h-0">
            <GameInfo />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
