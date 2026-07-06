'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion';
import { useGameStore, GameEvent } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';

// ─── Blink overlay component ─────────────────────────────────────
const BlinkLid = ({ cx, cy, r, isBlinking }: { cx: number; cy: number; r: number; isBlinking: boolean }) => (
  <AnimatePresence>
    {isBlinking && (
      <motion.ellipse
        cx={cx} cy={cy}
        rx={r + 0.5}
        ry={r + 0.5}
        fill="#1B5E20"
        initial={{ ry: 0 }}
        animate={{ ry: [0, r + 0.5, 0] }}
        transition={{ duration: 0.12, ease: 'easeInOut' }}
      />
    )}
  </AnimatePresence>
);

// ─── Detailed T-Rex SVG ──────────────────────────────────────────
export const TRexSVG = ({
  isAngry = false,
  isDefeated = false,
  isBlinking = false,
}: {
  isAngry?: boolean;
  isDefeated?: boolean;
  isBlinking?: boolean;
}) => (
  <svg suppressHydrationWarning viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trex-skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={isDefeated ? '#5a7a5c' : '#2E7D32'} />
        <stop offset="50%" stopColor={isDefeated ? '#3a5a3c' : '#1B5E20'} />
        <stop offset="100%" stopColor={isDefeated ? '#2a4a2c' : '#0A3D0A'} />
      </linearGradient>
      <linearGradient id="trex-belly" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#81C784" />
        <stop offset="100%" stopColor="#4CAF50" />
      </linearGradient>
      <radialGradient id="trex-eye-iris" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={isAngry ? '#FF4500' : '#FFC107'} />
        <stop offset="100%" stopColor={isAngry ? '#8B0000' : '#FF8F00'} />
      </radialGradient>
      <filter id="trex-shadow">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
      </filter>
      <filter id="trex-eye-glow">
        <feGaussianBlur stdDeviation={isAngry ? '2.5' : '1.5'} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Main Body/Neck */}
    <path
      d="M 120 160 Q 110 100 120 70 Q 130 30 90 20 C 60 10 30 25 25 40 Q 20 60 40 70 Q 60 75 80 70 L 75 90 Q 50 85 45 100 Q 40 115 65 115 Q 85 110 100 120 Q 105 140 100 160 Z"
      fill="url(#trex-skin)"
      filter="url(#trex-shadow)"
    />
    <path d="M 100 160 Q 105 140 100 120 Q 85 110 65 115 Q 80 125 80 160 Z" fill="url(#trex-belly)" opacity="0.8" />
    <path d="M 80 70 L 75 90 Q 50 85 45 100 Q 55 95 70 85 Z" fill="url(#trex-belly)" opacity="0.8" />

    {/* Angry brow ridge */}
    {isAngry && (
      <path d="M 55 22 Q 70 12 88 18" stroke="#8B0000" strokeWidth="5" fill="none" strokeLinecap="round" />
    )}

    {/* Eye Socket Ridges */}
    <path d="M 60 25 Q 70 15 85 20" stroke="#1B5E20" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M 65 35 Q 75 30 85 35" stroke="#0A3D0A" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Eye */}
    <circle cx="75" cy="28" r="5" fill="#000" />
    {!isBlinking && (
      <>
        <circle cx="76" cy="28" r="2.5" fill="url(#trex-eye-iris)" filter="url(#trex-eye-glow)" />
        <ellipse cx="76" cy="28" rx={isAngry ? '0.8' : '0.5'} ry={isAngry ? '2' : '1.5'} fill="#000" />
        <circle cx="77" cy="27" r="0.7" fill="rgba(255,255,255,0.7)" />
      </>
    )}
    {/* Blink lid */}
    {isBlinking && <ellipse cx="75" cy="28" rx="5.5" ry="5" fill="#1B5E20" />}

    {/* Nostril */}
    <circle cx="35" cy="40" r="2" fill="#0A3D0A" />
    <circle cx="38" cy="44" r="1.2" fill="#0A3D0A" />

    {/* Teeth */}
    <path d="M 30 70 L 33 78 L 36 70 Z" fill="#FFF" />
    <path d="M 40 72 L 43 82 L 46 72 Z" fill="#FFF" />
    <path d="M 50 72 L 53 84 L 56 71 Z" fill="#FFF" />
    <path d="M 60 70 L 63 78 L 66 70 Z" fill="#FFF" />

    {isAngry && (
      <path d="M 40 76 Q 47 84 54 76" stroke="#CC0000" strokeWidth="3" fill="none" strokeLinecap="round" />
    )}

    {/* Scales */}
    <path d="M 100 40 Q 110 45 105 55" stroke="#0A3D0A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 115 70 Q 120 80 115 90" stroke="#0A3D0A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 110 100 Q 115 110 110 120" stroke="#0A3D0A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 95 30 Q 105 35 100 45" stroke="#0A3D0A" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Tiny arm */}
    <path d="M 90 90 Q 100 95 105 88 Q 103 85 98 88 Z" fill="url(#trex-skin)" />
    <path d="M 98 88 L 104 84" stroke="#0A3D0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 101 89 L 106 86" stroke="#0A3D0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

// ─── Particle ─────────────────────────────────────────────────────
const RexParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full bg-orange-500 pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 1, scale: 1 }}
    animate={{ opacity: 0, scale: 0, y: -40 + Math.random() * 80, x: -30 + Math.random() * 60 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
  />
);

// ─── Ground shake ────────────────────────────────────────────────
const GroundShake = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent rounded-full"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1, 0], scaleX: [0, 1, 1.2, 1, 0] }}
        transition={{ duration: 0.5 }}
      />
    )}
  </AnimatePresence>
);

// ─── Reaction configs ────────────────────────────────────────────
type ReactionConfig = {
  animation: TargetAndTransition;
  transition: Transition;
  sound?: () => void;
  loop?: boolean;
  isAngry?: boolean;
  isDefeated?: boolean;
  particles?: boolean;
  groundShake?: boolean;
};

function getReaction(event: GameEvent): ReactionConfig | null {
  switch (event) {
    case 'game-start':
      return {
        animation: { scale: [0, 1.3, 0.95, 1.05, 1], y: [-60, 15, -5, 5, 0], opacity: [0, 1, 1, 1, 1], rotate: [0, -8, 5, -2, 0] },
        transition: { duration: 0.9, times: [0, 0.4, 0.6, 0.8, 1], ease: 'easeOut' },
        sound: () => soundEngine.roar(),
        isAngry: true,
        groundShake: true,
      };
    case 'thinking':
      return {
        animation: { scale: [1, 1.03, 1], y: [0, -4, 0], rotate: [0, 1, -1, 0] },
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        sound: () => soundEngine.rexBreathing(),
      };
    case 'ai-move':
      return {
        animation: { y: [0, -20, 5, 0], scale: [1, 1.15, 1.05, 1], rotate: [0, -5, 5, 0] },
        transition: { duration: 0.45, times: [0, 0.3, 0.7, 1] },
        sound: () => soundEngine.rexSnarl(),
        isAngry: true,
        groundShake: true,
      };
    case 'player-move':
      return {
        animation: { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] },
        transition: { duration: 0.35 },
      };
    case 'player-capture':
      return {
        animation: { x: [-20, 20, -15, 15, -8, 8, 0], scale: [1, 1.1, 1.05, 1], rotate: [0, -8, 8, 0] },
        transition: { duration: 0.55 },
        sound: () => soundEngine.rexSnarl(),
        isAngry: true,
      };
    case 'capture':
      return {
        animation: { scale: [1, 1.6, 1.6, 1.2, 1], x: [0, 40, -40, 10, 0], y: [0, -25, -25, 0, 0], rotate: [0, 20, -20, 5, 0] },
        transition: { duration: 0.7, times: [0, 0.2, 0.55, 0.8, 1] },
        sound: () => { soundEngine.roar(); setTimeout(() => soundEngine.rexBite(), 150); },
        isAngry: true,
        particles: true,
        groundShake: true,
      };
    case 'player-check':
      return {
        animation: { rotate: [0, -20, 20, -10, 10, 0], scale: [1, 0.85, 1.05, 0.95, 1], y: [0, 8, -5, 3, 0] },
        transition: { duration: 0.7 },
        sound: () => soundEngine.rexSnarl(),
        isAngry: true,
      };
    case 'check':
      return {
        animation: { scale: [1, 1.35, 1.1, 1], y: [0, -18, -5, 0], rotate: [0, 10, -10, 0] },
        transition: { duration: 0.4 },
        sound: () => soundEngine.roar(),
        isAngry: true,
        groundShake: true,
      };
    case 'checkmate':
      return {
        animation: { scale: [1, 2, 2, 1.5, 1], y: [0, -40, -40, -20, 0], rotate: [0, -15, 15, -5, 0] },
        transition: { duration: 1.5 },
        sound: () => { soundEngine.rexVictoryBellow(); setTimeout(() => soundEngine.rexStomp(), 800); },
        isAngry: true,
        particles: true,
        groundShake: true,
      };
    case 'win':
      return {
        animation: { scale: [1, 0.9, 0.7, 0.5, 0.2], opacity: [1, 0.8, 0.6, 0.3, 0], y: [0, 10, 20, 40, 80], rotate: [0, -30, 60, -90, -180] },
        transition: { duration: 2, ease: 'easeIn' },
        sound: () => soundEngine.rexDefeat(),
        isDefeated: true,
      };
    case 'loss':
      return {
        animation: { scale: [1, 1.4, 1.2, 1.4, 1.2], y: [0, -25, -15, -25, -15], rotate: [0, -8, 8, -8, 8] },
        transition: { duration: 1.0, repeat: Infinity, repeatType: 'reverse' },
        sound: () => soundEngine.rexVictoryBellow(),
        isAngry: true,
        particles: true,
        groundShake: true,
        loop: true,
      };
    case 'stalemate':
      return {
        animation: { scale: [1, 1.05, 0.98, 1], rotate: [0, 5, -5, 0] },
        transition: { duration: 0.8 },
        sound: () => soundEngine.playStalemate(),
      };
    default:
      return null;
  }
}

// ─── Component ──────────────────────────────────────────────────
export default function TRexAvatar({ preview = false }: { preview?: boolean }) {
  const lastEvent = useGameStore((s) => s.lastEvent);
  const lastEventTimestamp = useGameStore((s) => s.lastEventTimestamp);
  const audioUnlocked = useGameStore((s) => s.audioUnlocked);

  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentAnim, setCurrentAnim] = useState<TargetAndTransition | null>(null);
  const [currentTransition, setCurrentTransition] = useState<Transition | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showGroundShake, setShowGroundShake] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const prevTimestamp = useRef(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ─── Random blink loop ─────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 4000;
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 130);
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

    setIsAngry(!!reaction.isAngry);
    setIsDefeated(!!reaction.isDefeated);

    if (reaction.particles) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 800);
    }
    if (reaction.groundShake) {
      setShowGroundShake(true);
      setTimeout(() => setShowGroundShake(false), 600);
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
      {showParticles && Array.from({ length: 8 }).map((_, i) => (
        <RexParticle key={i} x={40 + Math.random() * 80} y={20 + Math.random() * 100} delay={i * 0.05} />
      ))}

      <motion.div
        key={animKey}
        animate={currentAnim ?? { y: [0, -6, 0], scale: [1, 1.02, 1] }}
        transition={currentTransition ?? { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (currentAnim && !isLooping && lastEvent !== 'thinking') {
            setCurrentAnim(null);
            setCurrentTransition(null);
            setIsAngry(false);
            setIsDefeated(false);
          }
        }}
        className="relative"
        style={isAngry ? { filter: 'drop-shadow(0 0 10px rgba(220,38,38,0.5))' } : undefined}
      >
        <div className="flex items-center justify-center w-[160px] h-[160px]">
          <TRexSVG isAngry={isAngry} isDefeated={isDefeated} isBlinking={isBlinking} />
        </div>
        <GroundShake active={showGroundShake} />
      </motion.div>

      {isDefeated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute inset-0 rounded-full bg-gray-700 blur-2xl -z-10"
        />
      )}
    </div>
  );
}
