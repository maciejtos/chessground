'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useTranslation } from '@/lib/i18n';
import TRexAvatar from './TRexAvatar';
import ElephantAvatar from './ElephantAvatar';
import CreeperAvatar from './CreeperAvatar';
import NinjaAvatar from './NinjaAvatar';
import BatmanAvatar from './BatmanAvatar';

const avatarComponents = {
  trex: TRexAvatar,
  elephant: ElephantAvatar,
  creeper: CreeperAvatar,
  ninja: NinjaAvatar,
  batman: BatmanAvatar,
};

export default function AvatarWrapper() {
  const { t } = useTranslation();
  const currentAvatar = useGameStore((s) => s.currentAvatar);
  const speechText = useGameStore((s) => s.speechText);
  const showSpeechBubble = useGameStore((s) => s.showSpeechBubble);
  const difficulty = useGameStore((s) => s.difficulty);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeAvatar = mounted ? currentAvatar : 'trex';
  const AvatarComponent = avatarComponents[activeAvatar];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      {/* Speech bubble */}
      <AnimatePresence>
        {showSpeechBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 min-w-max"
          >
            <div className="bg-white text-gray-900 px-5 py-2.5 rounded-2xl shadow-2xl shadow-black/50 text-sm font-black relative border-2 border-amber-400">
              {speechText}
              {/* Bubble tail */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-amber-400 rotate-45 rounded-sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar */}
      <div className="w-full h-full flex items-center justify-center transform scale-125 origin-center">
        <AvatarComponent />
      </div>
    </div>
  );
}
