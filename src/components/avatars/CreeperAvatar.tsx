'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion';
import { useGameStore, GameEvent } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';

// ─── Minecraft Creeper SVG – NORMAL FROWN FACE ───────────────────
export const CreeperSVG = ({
  isExploding = false,
  isCharged = false,
  isBlinking = false,
}: {
  isExploding?: boolean;
  isCharged?: boolean;
  isBlinking?: boolean;
}) => (
  <svg suppressHydrationWarning viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="creeper-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={isCharged ? '#7B1FA2' : '#41b346'} />
        <stop offset="50%" stopColor={isCharged ? '#6A1B9A' : '#2ca332'} />
        <stop offset="100%" stopColor={isCharged ? '#4A148C' : '#1e8a24'} />
      </linearGradient>
      <pattern id="creeper-texture" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="10" height="10" fill="rgba(0,0,0,0.07)" />
        <rect x="10" y="10" width="10" height="10" fill="rgba(0,0,0,0.12)" />
        <rect x="0" y="10" width="10" height="10" fill="rgba(255,255,255,0.06)" />
        <rect x="10" y="0" width="10" height="10" fill="rgba(255,255,255,0.03)" />
      </pattern>
      <filter id="creeper-eye-glow">
        <feGaussianBlur stdDeviation={isCharged ? '4' : '2.5'} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Body */}
    <rect width="160" height="160" fill="url(#creeper-bg)" rx="6" />
    <rect width="160" height="160" fill="url(#creeper-texture)" rx="6" />

    {/* Block highlights */}
    <rect x="0" y="0" width="160" height="8" fill="rgba(255,255,255,0.12)" rx="6" />
    <rect x="0" y="0" width="8" height="160" fill="rgba(255,255,255,0.08)" />
    <rect x="0" y="152" width="160" height="8" fill="rgba(0,0,0,0.15)" rx="6" />
    <rect x="152" y="0" width="8" height="160" fill="rgba(0,0,0,0.10)" />

    {/* Charged outline */}
    {isCharged && (
      <>
        <rect x="4" y="4" width="152" height="152" fill="none" stroke="#CE93D8" strokeWidth="3" rx="5" strokeDasharray="8 4" opacity="0.7" />
        <rect x="8" y="8" width="144" height="144" fill="none" stroke="#9C27B0" strokeWidth="2" rx="4" strokeDasharray="6 6" opacity="0.5" />
      </>
    )}

    {/* Eyes – Minecraft square style */}
    {isBlinking ? (
      <>
        {/* Blink: thin horizontal strips */}
        <rect x="18" y="54" width="44" height="10" fill={isCharged ? '#CE93D8' : '#0b170c'} rx="2" />
        <rect x="98" y="54" width="44" height="10" fill={isCharged ? '#CE93D8' : '#0b170c'} rx="2" />
      </>
    ) : (
      <>
        <rect
          x="18" y="36" width="44" height="44"
          fill={isExploding ? '#FF5722' : isCharged ? '#CE93D8' : '#0b170c'}
          filter="url(#creeper-eye-glow)"
          rx="2"
        />
        <rect
          x="98" y="36" width="44" height="44"
          fill={isExploding ? '#FF5722' : isCharged ? '#CE93D8' : '#0b170c'}
          filter="url(#creeper-eye-glow)"
          rx="2"
        />
        {/* Eye reflection pixels */}
        <rect x="22" y="40" width="10" height="10" fill={isCharged ? '#E1BEE7' : '#32a852'} opacity="0.6" rx="1" />
        <rect x="102" y="40" width="10" height="10" fill={isCharged ? '#E1BEE7' : '#32a852'} opacity="0.6" rx="1" />
        {/* Pupils */}
        <rect x="32" y="52" width="8" height="8" fill="rgba(0,0,0,0.5)" rx="1" />
        <rect x="112" y="52" width="8" height="8" fill="rgba(0,0,0,0.5)" rx="1" />
      </>
    )}

    {/* Mouth – canonical Creeper frown */}
    {/* Center nose block */}
    <rect x="60" y="80" width="40" height="20" fill={isExploding ? '#FF5722' : '#0b170c'} rx="2" />
    {/* Left frown drop */}
    <rect x="40" y="100" width="20" height="40" fill={isExploding ? '#FF5722' : '#0b170c'} rx="2" />
    {/* Right frown drop */}
    <rect x="100" y="100" width="20" height="40" fill={isExploding ? '#FF5722' : '#0b170c'} rx="2" />
    {/* Left frown inner fill (makes the frown shape) */}
    <rect x="60" y="100" width="20" height="20" fill={isExploding ? '#FF5722' : '#0b170c'} rx="1" />
    <rect x="80" y="100" width="20" height="20" fill={isExploding ? '#FF5722' : '#0b170c'} rx="1" />

    {/* Exploding inner glow */}
    {isExploding && (
      <>
        <rect x="20" y="20" width="120" height="120" fill="rgba(255,87,34,0.25)" rx="4" />
        <line x1="0" y1="0" x2="60" y2="60" stroke="#FF8F00" strokeWidth="3" opacity="0.7" />
        <line x1="160" y1="0" x2="100" y2="70" stroke="#FF8F00" strokeWidth="2" opacity="0.6" />
        <line x1="80" y1="0" x2="80" y2="80" stroke="#FF8F00" strokeWidth="2" opacity="0.5" />
      </>
    )}

    {/* Charged lightning bolts */}
    {isCharged && (
      <>
        <path d="M 10 60 L 18 80 L 12 80 L 20 100" stroke="#CE93D8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M 150 50 L 142 70 L 148 70 L 140 95" stroke="#CE93D8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M 80 5 L 88 22 L 82 22 L 90 40" stroke="#E1BEE7" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
      </>
    )}
  </svg>
);

// ─── Explosion fragments ─────────────────────────────────────────
const ExplosionFragment = ({ i }: { i: number }) => {
  const colors = ['#4CAF50', '#2E7D32', '#8BC34A', '#CDDC39', '#FF9800'];
  const angle = (i / 12) * 360;
  const dist = 40 + Math.random() * 60;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 8 + Math.random() * 12,
        height: 8 + Math.random() * 12,
        background: colors[i % colors.length],
        left: '50%',
        top: '50%',
        borderRadius: 2,
      }}
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        x: Math.cos((angle * Math.PI) / 180) * dist,
        y: Math.sin((angle * Math.PI) / 180) * dist,
        rotate: angle * 3,
        scale: [1, 0.5, 0],
      }}
      transition={{ duration: 0.8, delay: i * 0.03, ease: 'easeOut' }}
    />
  );
};

// ─── Reaction configs ────────────────────────────────────────────
type ReactionConfig = {
  animation: TargetAndTransition;
  transition: Transition;
  sound?: () => void;
  loop?: boolean;
  isExploding?: boolean;
  isCharged?: boolean;
  explosion?: boolean;
};

function getReaction(event: GameEvent): ReactionConfig | null {
  switch (event) {
    case 'game-start':
      return {
        animation: { scale: [0.5, 1.2, 0.95, 1.08, 1], y: [-50, 8, -3, 5, 0], opacity: [0, 1, 1, 1, 1] },
        transition: { duration: 0.8, times: [0, 0.35, 0.6, 0.8, 1] },
        sound: () => soundEngine.hiss(),
      };
    case 'thinking':
      return {
        animation: { scale: [1, 1.06, 1.04, 1] },
        transition: { duration: 2.2, repeat: Infinity },
        sound: () => soundEngine.creeperBreathing(),
        isCharged: true,
      };
    case 'ai-move':
      return {
        animation: { scale: [1, 1.1, 1], y: [0, -10, 0] },
        transition: { duration: 0.25 },
        sound: () => soundEngine.creeperSneak(),
        isCharged: true,
      };
    case 'player-move':
      return {
        animation: { scale: [1, 1.06, 1] },
        transition: { duration: 0.22 },
      };
    case 'player-capture':
      return {
        animation: { x: [-12, 12, -10, 10, -6, 6, 0], scale: [1, 1.15, 1.1, 1] },
        transition: { duration: 0.45 },
        sound: () => soundEngine.creeperFuse(),
        isCharged: true,
      };
    case 'capture':
      return {
        animation: {
          scale: [1, 1.8, 2.8, 0.1, 1],
          rotate: [0, -15, 25, -40, 0],
          opacity: [1, 1, 1, 0.7, 1],
        },
        transition: { duration: 0.75, times: [0, 0.2, 0.45, 0.6, 1] },
        sound: () => soundEngine.creeperExplosion(),
        isExploding: true,
        explosion: true,
      };
    case 'player-check':
      return {
        animation: { scale: [1, 1.5, 0.85, 1.1, 1] },
        transition: { duration: 0.55 },
        sound: () => soundEngine.creeperFuse(),
        isCharged: true,
      };
    case 'check':
      return {
        animation: { y: [0, -18, 4, 0], scale: [1, 1.18, 1.05, 1] },
        transition: { duration: 0.35 },
        sound: () => soundEngine.hiss(),
      };
    case 'checkmate':
    case 'win':
      return {
        animation: { scale: [1, 2.5, 3, 0], rotate: [0, -50, 60, -120], opacity: [1, 1, 0.8, 0] },
        transition: { duration: 1.2, times: [0, 0.3, 0.6, 1] },
        sound: () => soundEngine.creeperExplosion(),
        isExploding: true,
        explosion: true,
      };
    case 'loss':
      return {
        animation: { scale: [1, 1.25, 1.3, 1.25, 1.3], y: [0, -12, -8, -12, -8], rotate: [0, -6, 6, -6, 6] },
        transition: { duration: 0.6, repeat: Infinity, repeatType: 'reverse' },
        sound: () => soundEngine.creeperVictory(),
        isCharged: true,
        loop: true,
      };
    case 'stalemate':
      return {
        animation: { scale: [1, 1.04, 0.97, 1] },
        transition: { duration: 0.8 },
        sound: () => soundEngine.playStalemate(),
      };
    default:
      return null;
  }
}

// ─── Component ──────────────────────────────────────────────────
export default function CreeperAvatar({ preview = false }: { preview?: boolean }) {
  const lastEvent = useGameStore((s) => s.lastEvent);
  const lastEventTimestamp = useGameStore((s) => s.lastEventTimestamp);
  const audioUnlocked = useGameStore((s) => s.audioUnlocked);

  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentAnim, setCurrentAnim] = useState<TargetAndTransition | null>(null);
  const [currentTransition, setCurrentTransition] = useState<Transition | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const prevTimestamp = useRef(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ─── Random blink loop ─────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 5000;
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 110);
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

    setIsExploding(!!reaction.isExploding);
    setIsCharged(!!reaction.isCharged);

    if (reaction.explosion) {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 900);
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
      {showExplosion && Array.from({ length: 12 }).map((_, i) => <ExplosionFragment key={i} i={i} />)}

      <motion.div
        key={animKey}
        animate={currentAnim ?? { y: [0, -3, 0], scale: [1, 1.02, 1] }}
        transition={currentTransition ?? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (currentAnim && !isLooping && lastEvent !== 'thinking') {
            setCurrentAnim(null);
            setCurrentTransition(null);
            setIsExploding(false);
            setIsCharged(false);
          }
        }}
        className="relative"
        style={
          isCharged
            ? { filter: 'drop-shadow(0 0 10px rgba(156,39,176,0.55))' }
            : isExploding
            ? { filter: 'drop-shadow(0 0 16px rgba(255,87,34,0.7))' }
            : undefined
        }
      >
        {/* Explosion flash */}
        <AnimatePresence>
          {isExploding && (
            <motion.div
              className="absolute inset-0 bg-orange-300 rounded-lg pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4, 0.9, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center w-[160px] h-[160px]">
          <CreeperSVG isExploding={isExploding} isCharged={isCharged} isBlinking={isBlinking} />
        </div>
      </motion.div>
    </div>
  );
}
