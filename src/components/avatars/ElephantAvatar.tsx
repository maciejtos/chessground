'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion';
import { useGameStore, GameEvent } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';

// ─── Detailed Elephant SVG ──────────────────────────────────────
export const ElephantSVG = ({
  isCelebrating = false,
  isSad = false,
  trunkRaised = false,
  isBlinking = false,
}: {
  isCelebrating?: boolean;
  isSad?: boolean;
  trunkRaised?: boolean;
  isBlinking?: boolean;
}) => (
  <svg suppressHydrationWarning viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="elephant-skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={isSad ? '#78909C' : '#90A4AE'} />
        <stop offset="50%" stopColor={isSad ? '#546E7A' : '#78909C'} />
        <stop offset="100%" stopColor={isSad ? '#37474F' : '#546E7A'} />
      </linearGradient>
      <linearGradient id="elephant-inner-ear" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={isCelebrating ? '#FFD54F' : '#F48FB1'} />
        <stop offset="100%" stopColor={isCelebrating ? '#FF8F00' : '#E91E63'} />
      </linearGradient>
      <filter id="elephant-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Left Ear */}
    <path d="M 58 42 Q 8 15 3 58 Q -2 100 18 122 Q 38 144 60 100 Z" fill="url(#elephant-skin)" filter="url(#elephant-shadow)" />
    <path d="M 53 52 Q 18 38 13 65 Q 8 92 23 107 Q 38 122 53 90 Z" fill="url(#elephant-inner-ear)" opacity="0.7" />
    <path d="M 20 55 Q 30 70 20 90" stroke="#546E7A" strokeWidth="1" fill="none" opacity="0.5" />
    <path d="M 28 60 Q 38 75 30 95" stroke="#546E7A" strokeWidth="1" fill="none" opacity="0.5" />

    {/* Right Ear */}
    <path d="M 102 42 Q 152 15 157 58 Q 162 100 142 122 Q 122 144 100 100 Z" fill="url(#elephant-skin)" filter="url(#elephant-shadow)" />
    <path d="M 107 52 Q 142 38 147 65 Q 152 92 137 107 Q 122 122 107 90 Z" fill="url(#elephant-inner-ear)" opacity="0.7" />
    <path d="M 140 55 Q 130 70 140 90" stroke="#546E7A" strokeWidth="1" fill="none" opacity="0.5" />
    <path d="M 132 60 Q 122 75 130 95" stroke="#546E7A" strokeWidth="1" fill="none" opacity="0.5" />

    {/* Head */}
    <circle cx="80" cy="65" r="36" fill="url(#elephant-skin)" filter="url(#elephant-shadow)" />

    {/* Forehead wrinkles */}
    <path d="M 60 48 Q 80 44 100 48" stroke="#546E7A" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
    <path d="M 65 54 Q 80 50 95 54" stroke="#546E7A" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />

    {/* Eyes */}
    <circle cx="64" cy="56" r="5" fill="#1a1a1a" />
    <circle cx="96" cy="56" r="5" fill="#1a1a1a" />

    {/* Blink lids */}
    {isBlinking ? (
      <>
        <ellipse cx="64" cy="56" rx="5.5" ry="5" fill="url(#elephant-skin)" />
        <ellipse cx="96" cy="56" rx="5.5" ry="5" fill="url(#elephant-skin)" />
      </>
    ) : (
      <>
        <circle cx="64" cy="56" r="2.5" fill={isCelebrating ? '#FFC107' : '#FAFAFA'} />
        <circle cx="96" cy="56" r="2.5" fill={isCelebrating ? '#FFC107' : '#FAFAFA'} />
        <circle cx="65" cy="56" r="1.2" fill="#000" />
        <circle cx="97" cy="56" r="1.2" fill="#000" />
        <circle cx="66" cy="54.5" r="0.8" fill="#fff" />
        <circle cx="98" cy="54.5" r="0.8" fill="#fff" />
      </>
    )}

    {/* Eyebrows */}
    <path
      d={isSad ? 'M 57 50 Q 64 54 71 52' : isCelebrating ? 'M 57 48 Q 64 44 71 48' : 'M 57 50 Q 64 47 71 50'}
      stroke="#546E7A" strokeWidth="2.5" fill="none" strokeLinecap="round"
    />
    <path
      d={isSad ? 'M 103 50 Q 96 54 89 52' : isCelebrating ? 'M 103 48 Q 96 44 89 48' : 'M 103 50 Q 96 47 89 50'}
      stroke="#546E7A" strokeWidth="2.5" fill="none" strokeLinecap="round"
    />

    {/* Tusks */}
    <path d="M 60 85 Q 43 102 38 124 Q 43 112 53 97 Z" fill="#FFFDE7" filter="url(#elephant-shadow)" />
    <path d="M 100 85 Q 117 102 122 124 Q 117 112 107 97 Z" fill="#FFFDE7" filter="url(#elephant-shadow)" />
    <path d="M 40 120 Q 42 118 44 121" stroke="#FFF9C4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 120 120 Q 118 118 116 121" stroke="#FFF9C4" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Trunk */}
    {trunkRaised ? (
      <>
        <path
          d="M 68 72 Q 78 67 90 72 C 100 80 110 60 105 40 Q 100 25 90 20"
          fill="url(#elephant-skin)"
          filter="url(#elephant-shadow)"
        />
        <path d="M 72 75 Q 78 72 84 75" stroke="#546E7A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 76 65 Q 82 60 88 65" stroke="#546E7A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 82 52 Q 87 46 92 49" stroke="#546E7A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="90" cy="20" rx="5" ry="4" fill="#78909C" />
      </>
    ) : (
      <>
        <path
          d="M 68 72 Q 78 67 90 72 C 96 102 100 132 88 147 Q 78 157 68 147 C 56 132 62 102 68 72 Z"
          fill="url(#elephant-skin)"
          filter="url(#elephant-shadow)"
        />
        <path d="M 71 92 Q 78 94 85 92" stroke="#546E7A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 70 107 Q 78 109 86 107" stroke="#546E7A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 70 122 Q 78 124 86 122" stroke="#546E7A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 72 137 Q 78 139 84 137" stroke="#546E7A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="74" cy="148" r="2" fill="#546E7A" />
        <circle cx="81" cy="149" r="2" fill="#546E7A" />
      </>
    )}

    {/* Celebration sparkles */}
    {isCelebrating && (
      <>
        <circle cx="30" cy="30" r="3" fill="#FFC107" opacity="0.85" />
        <circle cx="130" cy="25" r="2" fill="#FFC107" opacity="0.85" />
        <circle cx="20" cy="80" r="2.5" fill="#FF9800" opacity="0.85" />
        <circle cx="140" cy="75" r="2" fill="#FF9800" opacity="0.85" />
        <path d="M 25 35 L 28 30 L 31 35 L 28 40 Z" fill="#FFC107" opacity="0.85" />
        <path d="M 130 30 L 133 25 L 136 30 L 133 35 Z" fill="#FFC107" opacity="0.85" />
      </>
    )}

    {/* Sad tears */}
    {isSad && (
      <>
        <ellipse cx="62" cy="62" rx="1.5" ry="3" fill="#90CAF9" opacity="0.8" />
        <ellipse cx="94" cy="62" rx="1.5" ry="3" fill="#90CAF9" opacity="0.8" />
      </>
    )}
  </svg>
);

// ─── Confetti particle ────────────────────────────────────────────
const ElephantConfetti = ({ i }: { i: number }) => {
  const colors = ['#FFC107', '#FF9800', '#4CAF50', '#2196F3', '#E91E63'];
  return (
    <motion.div
      className="absolute w-2 h-3 rounded-sm pointer-events-none"
      style={{
        background: colors[i % colors.length],
        left: `${20 + (i * 17) % 80}%`,
        top: `${10 + (i * 13) % 30}%`,
        transform: `rotate(${i * 37}deg)`,
      }}
      initial={{ opacity: 1, y: 0, x: 0, rotate: i * 37 }}
      animate={{ opacity: [1, 1, 0], y: [0, -20, 60], x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5), 0], rotate: [i * 37, i * 37 + 360] }}
      transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
    />
  );
};

// ─── Reaction configs ────────────────────────────────────────────
type ReactionConfig = {
  animation: TargetAndTransition;
  transition: Transition;
  sound?: () => void;
  loop?: boolean;
  isCelebrating?: boolean;
  isSad?: boolean;
  trunkRaised?: boolean;
  confetti?: boolean;
};

function getReaction(event: GameEvent): ReactionConfig | null {
  switch (event) {
    case 'game-start':
      return {
        animation: { scale: [0, 1.25, 0.95, 1.08, 1], y: [-50, 10, -3, 5, 0], opacity: [0, 1, 1, 1, 1] },
        transition: { duration: 1.0, times: [0, 0.35, 0.6, 0.8, 1], ease: 'easeOut' },
        sound: () => soundEngine.trumpet(),
        trunkRaised: true,
        isCelebrating: true,
      };
    case 'thinking':
      return {
        animation: { rotate: [0, -2.5, 2.5, 0], scale: [1, 1.02, 0.99, 1] },
        transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
        sound: () => soundEngine.elephantRumble(),
      };
    case 'ai-move':
      return {
        animation: { y: [0, -12, 3, 0], scale: [1, 1.08, 1.02, 1], rotate: [0, -3, 3, 0] },
        transition: { duration: 0.5, times: [0, 0.3, 0.7, 1] },
        sound: () => soundEngine.elephantEarFlap(),
      };
    case 'player-move':
      return {
        animation: { scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] },
        transition: { duration: 0.4 },
      };
    case 'player-capture':
      return {
        animation: { x: [-8, 8, -6, 6, -3, 3, 0], scale: [1, 1.05, 1], y: [0, 5, 0] },
        transition: { duration: 0.55 },
        sound: () => soundEngine.elephantStomp(),
      };
    case 'capture':
      return {
        animation: { scale: [1, 1.5, 1.5, 1.2, 1], y: [0, -40, -40, -10, 0], rotate: [0, -8, 8, -3, 0] },
        transition: { duration: 0.65, times: [0, 0.25, 0.5, 0.75, 1] },
        sound: () => soundEngine.elephantWarCry(),
        isCelebrating: true,
        trunkRaised: true,
      };
    case 'player-check':
      return {
        animation: { scale: [1, 0.88, 1.03, 0.97, 1], y: [0, 12, -5, 3, 0], rotate: [0, -5, 5, 0] },
        transition: { duration: 0.65 },
        sound: () => soundEngine.elephantStomp(),
        isSad: true,
      };
    case 'check':
      return {
        animation: { scale: [1, 1.3, 1.1, 1], y: [0, -22, -8, 0], rotate: [0, -10, 10, 0] },
        transition: { duration: 0.5 },
        sound: () => soundEngine.trumpet(),
        trunkRaised: true,
        isCelebrating: true,
      };
    case 'checkmate':
      return {
        animation: { scale: [1, 1.6, 1.6, 1.3, 1.5, 1.3], y: [0, -50, -50, -30, -40, -30], rotate: [0, -12, 12, -6, 6, 0] },
        transition: { duration: 2.0, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        sound: () => soundEngine.elephantFanfare(),
        isCelebrating: true,
        trunkRaised: true,
        confetti: true,
      };
    case 'win':
      return {
        animation: { scale: [1, 0.95, 0.8, 0.6, 0.3], opacity: [1, 0.9, 0.7, 0.4, 0], y: [0, 5, 15, 30, 60], rotate: [0, -10, 20, -30, 45] },
        transition: { duration: 2.2, ease: 'easeIn' },
        sound: () => soundEngine.elephantSadTrumpet(),
        isSad: true,
      };
    case 'loss':
      return {
        animation: { scale: [1, 1.35, 1.2, 1.35, 1.2], y: [0, -28, -15, -28, -15], rotate: [0, -6, 6, -6, 6] },
        transition: { duration: 1.1, repeat: Infinity, repeatType: 'reverse' },
        sound: () => soundEngine.elephantFanfare(),
        isCelebrating: true,
        trunkRaised: true,
        confetti: true,
        loop: true,
      };
    case 'stalemate':
      return {
        animation: { scale: [1, 1.05, 0.98, 1], rotate: [0, 3, -3, 0] },
        transition: { duration: 0.9 },
        sound: () => soundEngine.playStalemate(),
      };
    default:
      return null;
  }
}

// ─── Component ──────────────────────────────────────────────────
export default function ElephantAvatar({ preview = false }: { preview?: boolean }) {
  const lastEvent = useGameStore((s) => s.lastEvent);
  const lastEventTimestamp = useGameStore((s) => s.lastEventTimestamp);
  const audioUnlocked = useGameStore((s) => s.audioUnlocked);

  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentAnim, setCurrentAnim] = useState<TargetAndTransition | null>(null);
  const [currentTransition, setCurrentTransition] = useState<Transition | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isSad, setIsSad] = useState(false);
  const [trunkRaised, setTrunkRaised] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const prevTimestamp = useRef(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ─── Random blink loop ─────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const scheduleBlink = () => {
      const delay = 2800 + Math.random() * 4500;
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [mounted]);

  useEffect(() => {
    if (preview) return; // no reactions in preview/select mode
    if (!mounted || !lastEvent || lastEventTimestamp === prevTimestamp.current) return;
    prevTimestamp.current = lastEventTimestamp;
    const reaction = getReaction(lastEvent);
    if (!reaction) return;

    setIsCelebrating(!!reaction.isCelebrating);
    setIsSad(!!reaction.isSad);
    setTrunkRaised(!!reaction.trunkRaised);

    if (reaction.confetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }

    setTimeout(() => {
      setCurrentAnim(reaction.animation);
      setCurrentTransition(reaction.transition);
      setIsLooping(!!reaction.loop);
      setAnimKey((k) => k + 1);
    }, 0);

    if (audioUnlocked && reaction.sound) reaction.sound();
  }, [preview, lastEvent, lastEventTimestamp, audioUnlocked, mounted]);

  if (!mounted) return <div className="w-[160px] h-[160px]" />;

  return (
    <div className="flex flex-col items-center relative">
      {showConfetti && Array.from({ length: 10 }).map((_, i) => <ElephantConfetti key={i} i={i} />)}

      <motion.div
        key={animKey}
        animate={currentAnim ?? { y: [0, -4, 0], rotate: [0, 0.5, -0.5, 0] }}
        transition={currentTransition ?? { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (currentAnim && !isLooping && lastEvent !== 'thinking') {
            setCurrentAnim(null);
            setCurrentTransition(null);
            setIsCelebrating(false);
            setIsSad(false);
            setTrunkRaised(false);
          }
        }}
        className="relative"
        style={
          isCelebrating
            ? { filter: 'drop-shadow(0 0 12px rgba(251,192,45,0.55))' }
            : isSad
            ? { filter: 'drop-shadow(0 0 8px rgba(100,130,200,0.35))' }
            : undefined
        }
      >
        <div className="flex items-center justify-center w-[160px] h-[160px]">
          <ElephantSVG
            isCelebrating={isCelebrating}
            isSad={isSad}
            trunkRaised={trunkRaised}
            isBlinking={isBlinking}
          />
        </div>
      </motion.div>
    </div>
  );
}
