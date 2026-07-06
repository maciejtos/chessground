'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion';
import { useGameStore, GameEvent } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';

// ─── Ninjago Ninja SVG ───────────────────────────────────────────
export const NinjaSVG = ({
  isAttacking = false,
  isDefeated = false,
  isElemental = false,
  isBlinking = false,
}: {
  isAttacking?: boolean;
  isDefeated?: boolean;
  isElemental?: boolean;
  isBlinking?: boolean;
}) => (
  <svg suppressHydrationWarning viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ninja-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={isDefeated ? '#8B3030' : isElemental ? '#FF6F00' : '#d32f2f'} />
        <stop offset="50%" stopColor={isDefeated ? '#6B2020' : isElemental ? '#E65100' : '#b71c1c'} />
        <stop offset="100%" stopColor={isDefeated ? '#4B1515' : isElemental ? '#BF360C' : '#7f0000'} />
      </linearGradient>
      <linearGradient id="ninja-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={isElemental ? '#FFEB3B' : '#fff176'} />
        <stop offset="50%" stopColor={isElemental ? '#FF9800' : '#fbc02d'} />
        <stop offset="100%" stopColor={isElemental ? '#F57C00' : '#f57f17'} />
      </linearGradient>
      <linearGradient id="ninja-fire" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#FF5722" />
        <stop offset="50%" stopColor="#FF9800" />
        <stop offset="100%" stopColor="#FFEB3B" />
      </linearGradient>
      <filter id="ninja-glow">
        <feGaussianBlur stdDeviation={isElemental ? '4' : '2.5'} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="ninja-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
      </filter>
    </defs>

    {/* Main Hood */}
    <path
      d="M 28 152 Q 8 100 18 58 Q 28 18 80 13 Q 132 18 142 58 Q 152 100 132 152 Z"
      fill="url(#ninja-red)"
      filter="url(#ninja-shadow)"
    />
    <path
      d="M 35 152 Q 20 100 28 65 Q 36 30 80 25 Q 124 30 132 65 Q 140 100 125 152 Z"
      fill="rgba(0,0,0,0.15)"
    />

    {/* Hood folds */}
    <path d="M 80 13 Q 68 48 22 68" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M 80 13 Q 92 48 138 68" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M 18 112 Q 50 152 80 152 Q 110 152 142 112" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="5" fill="none" />
    <path d="M 25 90 Q 52 130 80 135 Q 108 130 135 90" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="3" fill="none" opacity="0.6" />

    {/* Face opening */}
    <path
      d="M 33 68 Q 80 58 127 68 Q 132 84 127 100 Q 80 106 33 100 Q 28 84 33 68 Z"
      fill="#1a1a1a"
      filter="url(#ninja-shadow)"
    />

    {/* Skin */}
    <path d="M 38 73 Q 80 66 122 73 Q 122 94 80 99 Q 38 94 38 73 Z" fill={isDefeated ? '#D4A017' : '#ffeb3b'} />

    {/* Battle scars when defeated */}
    {isDefeated && (
      <>
        <path d="M 58 75 L 62 88" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" />
        <path d="M 90 72 L 94 85" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" />
      </>
    )}

    {/* Eyebrows */}
    <path
      d={isDefeated ? 'M 44 79 Q 58 82 74 80' : isAttacking ? 'M 44 76 Q 58 70 74 78' : 'M 44 78 Q 58 73 74 80'}
      stroke="#000" strokeWidth="6" strokeLinecap="round"
    />
    <path
      d={isDefeated ? 'M 116 79 Q 102 82 86 80' : isAttacking ? 'M 116 76 Q 102 70 86 78' : 'M 116 78 Q 102 73 86 80'}
      stroke="#000" strokeWidth="6" strokeLinecap="round"
    />

    {/* Eyes */}
    <circle cx="64" cy="89" r="4.5" fill="#000" />
    <circle cx="96" cy="89" r="4.5" fill="#000" />

    {/* Blink lids */}
    {isBlinking ? (
      <>
        <ellipse cx="64" cy="89" rx="4.8" ry="4.5" fill={isDefeated ? '#D4A017' : '#ffeb3b'} />
        <ellipse cx="96" cy="89" rx="4.8" ry="4.5" fill={isDefeated ? '#D4A017' : '#ffeb3b'} />
      </>
    ) : (
      <>
        <circle
          cx="64" cy="89" r="2.2"
          fill={isElemental ? 'url(#ninja-fire)' : isAttacking ? '#FF5722' : '#1565C0'}
          filter={isAttacking || isElemental ? 'url(#ninja-glow)' : undefined}
        />
        <circle
          cx="96" cy="89" r="2.2"
          fill={isElemental ? 'url(#ninja-fire)' : isAttacking ? '#FF5722' : '#1565C0'}
          filter={isAttacking || isElemental ? 'url(#ninja-glow)' : undefined}
        />
        <circle cx="65.5" cy="87.8" r="0.9" fill="rgba(255,255,255,0.8)" />
        <circle cx="97.5" cy="87.8" r="0.9" fill="rgba(255,255,255,0.8)" />
      </>
    )}

    {/* Headband */}
    <rect x="24" y="62" width="112" height="8" fill="url(#ninja-red)" opacity="0.85" rx="2" />
    <path d="M 26 64 Q 80 60 134 64" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />

    {/* Gold Emblem */}
    <path d="M 80 16 L 96 32 L 80 48 L 64 32 Z" fill="url(#ninja-gold)" filter="url(#ninja-glow)" />
    <path d="M 80 22 L 90 32 L 80 42 L 70 32 Z" fill="#f57f17" />
    <circle cx="80" cy="32" r="5" fill={isElemental ? '#FF5722' : '#fbc02d'} filter="url(#ninja-glow)" />
    <circle cx="80" cy="32" r="2.5" fill={isElemental ? '#FFEB3B' : '#FFFDE7'} />

    {/* Elemental flames */}
    {isElemental && (
      <>
        <path d="M 72 18 Q 68 10 72 5 Q 70 8 74 12 Q 75 6 78 3 Q 76 8 80 12" fill="url(#ninja-fire)" filter="url(#ninja-glow)" />
        <path d="M 80 18 Q 76 10 80 4 Q 78 9 82 13 Q 83 7 86 4 Q 84 9 88 12" fill="url(#ninja-fire)" filter="url(#ninja-glow)" opacity="0.8" />
        <path d="M 88 18 Q 84 10 88 5 Q 86 8 90 12 Q 91 6 94 3 Q 92 8 96 12" fill="url(#ninja-fire)" filter="url(#ninja-glow)" opacity="0.6" />
      </>
    )}

    {/* Katana (when attacking) */}
    {isAttacking && (
      <>
        <path d="M 135 50 L 158 8 L 155 10 L 132 52 Z" fill="#E0E0E0" filter="url(#ninja-glow)" />
        <ellipse cx="135" cy="52" rx="5" ry="3" fill="#FFD700" transform="rotate(-30, 135, 52)" />
        <path d="M 133 53 L 128 63" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 131 55 L 126 65" stroke="#7f0000" strokeWidth="2" strokeLinecap="round" />
        <path d="M 155 8 Q 145 20 130 45" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="4 3" />
      </>
    )}

    {/* Lower face mask */}
    <path d="M 23 103 Q 80 90 137 103 Q 132 132 80 147 Q 28 132 23 103 Z" fill="url(#ninja-red)" filter="url(#ninja-shadow)" />
    <path d="M 28 108 Q 80 98 132 108" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="3" fill="none" />
    <path d="M 38 118 Q 80 108 122 118" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="2.5" fill="none" opacity="0.7" />
    <path d="M 50 128 Q 80 120 110 128" stroke={isDefeated ? '#4B1515' : '#7f0000'} strokeWidth="2" fill="none" opacity="0.5" />

    {/* Neck knot */}
    <circle cx="80" cy="145" r="5" fill={isDefeated ? '#4B1515' : '#7f0000'} />
    <circle cx="80" cy="145" r="2.5" fill={isDefeated ? '#3B1010' : '#b71c1c'} />
  </svg>
);

// ─── Slash trail effect ──────────────────────────────────────────
const SlashTrail = ({ angle, i }: { angle: number; i: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: 80 + i * 20,
      height: 3,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
      left: '50%',
      top: '50%',
      transformOrigin: 'left center',
      transform: `rotate(${angle}deg) translateX(-50%)`,
    }}
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 1.2] }}
    transition={{ duration: 0.25, delay: i * 0.05 }}
  />
);

// ─── Ki energy orb ───────────────────────────────────────────────
const KiOrb = ({ i }: { i: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: 6 + i * 2,
      height: 6 + i * 2,
      background: `radial-gradient(circle, rgba(255,165,0,0.9), rgba(255,69,0,0.5))`,
      left: `${30 + (i * 20) % 60}%`,
      top: `${20 + (i * 15) % 50}%`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0.7, 0], scale: [0, 1.5, 1, 0], y: [-20, -10, -40] }}
    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
  />
);

// ─── Reaction configs ────────────────────────────────────────────
type ReactionConfig = {
  animation: TargetAndTransition;
  transition: Transition;
  sound?: () => void;
  loop?: boolean;
  isAttacking?: boolean;
  isDefeated?: boolean;
  isElemental?: boolean;
  slashTrails?: boolean;
  kiOrbs?: boolean;
};

function getReaction(event: GameEvent): ReactionConfig | null {
  switch (event) {
    case 'game-start':
      return {
        animation: { scale: [0.2, 1.3, 0.9, 1.08, 1], y: [-80, 5, -5, 3, 0], opacity: [0, 1, 1, 1, 1], rotate: [0, -10, 8, -3, 0] },
        transition: { duration: 0.75, times: [0, 0.35, 0.6, 0.8, 1] },
        sound: () => soundEngine.swordSlash(),
        isAttacking: true,
        slashTrails: true,
      };
    case 'thinking':
      return {
        animation: { y: [0, -1.5, 0], scale: [1, 1.01, 1] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        sound: () => soundEngine.ninjaStealth(),
      };
    case 'ai-move':
      return {
        animation: { x: [0, -8, 8, 0], scale: [1, 0.95, 1.05, 1] },
        transition: { duration: 0.15 },
        sound: () => soundEngine.swordSlash(),
        isAttacking: true,
        slashTrails: true,
      };
    case 'player-move':
      return {
        animation: { scale: [1, 0.94, 1.02, 1] },
        transition: { duration: 0.2 },
      };
    case 'player-capture':
      return {
        animation: { x: [-35, 35, -25, 25, -12, 12, 0], scale: [1, 0.8, 1, 0.9, 1], rotate: [0, -20, 20, -10, 10, 0] },
        transition: { duration: 0.5 },
        sound: () => soundEngine.ninjaParry(),
        isAttacking: true,
        slashTrails: true,
      };
    case 'capture':
      return {
        animation: {
          scale: [1, 1.8, 0, 0, 1.8, 1],
          x: [0, -100, -100, 100, 100, 0],
          rotate: [0, -45, -45, 45, 45, 0],
          opacity: [1, 0.5, 0, 0, 0.5, 1],
        },
        transition: { duration: 0.5, times: [0, 0.2, 0.35, 0.5, 0.75, 1] },
        sound: () => soundEngine.ninjaCombo(),
        isAttacking: true,
        slashTrails: true,
        kiOrbs: true,
      };
    case 'player-check':
      return {
        animation: { rotate: [0, -22, 22, -10, 10, 0], scale: [1, 0.88, 1.06, 0.97, 1] },
        transition: { duration: 0.6 },
        sound: () => soundEngine.ninjaParry(),
        isAttacking: true,
      };
    case 'check':
      return {
        animation: { scale: [1, 1.6, 1.2, 1], rotate: [0, 360, 360, 0], y: [0, -20, -5, 0] },
        transition: { duration: 0.5, times: [0, 0.4, 0.7, 1] },
        sound: () => soundEngine.ninjaKiYell(),
        isAttacking: true,
        isElemental: true,
        slashTrails: true,
        kiOrbs: true,
      };
    case 'checkmate':
      return {
        animation: { scale: [1, 2.2, 2.2, 1.5, 1.8, 1.5, 1.8], rotate: [0, 720, 720, 0, -360, 0, -360], y: [0, -60, -60, -30, -40, -30, -40] },
        transition: { duration: 2.5, times: [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1] },
        sound: () => soundEngine.ninjaVictory(),
        isAttacking: true,
        isElemental: true,
        slashTrails: true,
        kiOrbs: true,
      };
    case 'win':
      return {
        animation: { scale: [1, 0.85, 0.6, 0.3, 0], opacity: [1, 0.9, 0.6, 0.3, 0], y: [0, 8, 20, 45, 90], rotate: [0, 30, -60, 90, 180] },
        transition: { duration: 1.3, ease: 'easeIn' },
        sound: () => soundEngine.ninjaDefeat(),
        isDefeated: true,
      };
    case 'loss':
      return {
        animation: { scale: [1, 2.4, 2, 2.4, 2], rotate: [0, 720, 720, 1440, 1440], y: [0, -70, -60, -70, -60] },
        transition: { duration: 1.5, repeat: Infinity, repeatType: 'loop' },
        sound: () => soundEngine.ninjaVictory(),
        isAttacking: true,
        isElemental: true,
        slashTrails: true,
        kiOrbs: true,
        loop: true,
      };
    case 'stalemate':
      return {
        animation: { scale: [1, 1.05, 0.98, 1], rotate: [0, 5, -5, 0] },
        transition: { duration: 0.7 },
        sound: () => soundEngine.playStalemate(),
      };
    default:
      return null;
  }
}

// ─── Component ──────────────────────────────────────────────────
export default function NinjaAvatar({ preview = false }: { preview?: boolean }) {
  const lastEvent = useGameStore((s) => s.lastEvent);
  const lastEventTimestamp = useGameStore((s) => s.lastEventTimestamp);
  const audioUnlocked = useGameStore((s) => s.audioUnlocked);

  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentAnim, setCurrentAnim] = useState<TargetAndTransition | null>(null);
  const [currentTransition, setCurrentTransition] = useState<Transition | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [isElemental, setIsElemental] = useState(false);
  const [showSlashTrails, setShowSlashTrails] = useState(false);
  const [showKiOrbs, setShowKiOrbs] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const prevTimestamp = useRef(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ─── Random blink loop ─────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 4800;
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
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

    setIsAttacking(!!reaction.isAttacking);
    setIsDefeated(!!reaction.isDefeated);
    setIsElemental(!!reaction.isElemental);

    if (reaction.slashTrails) {
      setShowSlashTrails(true);
      setTimeout(() => setShowSlashTrails(false), 400);
    }
    if (reaction.kiOrbs) {
      setShowKiOrbs(true);
      setTimeout(() => setShowKiOrbs(false), 900);
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
      {showSlashTrails && (
        <>
          <SlashTrail angle={-30} i={0} />
          <SlashTrail angle={10} i={1} />
          <SlashTrail angle={50} i={2} />
        </>
      )}
      {showKiOrbs && Array.from({ length: 6 }).map((_, i) => <KiOrb key={i} i={i} />)}

      <motion.div
        key={animKey}
        animate={currentAnim ?? { y: [0, -2.5, 0], scale: [1, 1.01, 1] }}
        transition={currentTransition ?? { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (currentAnim && !isLooping && lastEvent !== 'thinking') {
            setCurrentAnim(null);
            setCurrentTransition(null);
            setIsAttacking(false);
            setIsDefeated(false);
            setIsElemental(false);
          }
        }}
        className="relative"
        style={
          isElemental
            ? { filter: 'drop-shadow(0 0 12px rgba(255,111,0,0.6))' }
            : isAttacking
            ? { filter: 'drop-shadow(0 0 8px rgba(183,28,28,0.5))' }
            : isDefeated
            ? { filter: 'drop-shadow(0 0 6px rgba(50,50,80,0.4))' }
            : undefined
        }
      >
        <div className="flex items-center justify-center w-[160px] h-[160px]">
          <NinjaSVG isAttacking={isAttacking} isDefeated={isDefeated} isElemental={isElemental} isBlinking={isBlinking} />
        </div>
      </motion.div>
    </div>
  );
}
