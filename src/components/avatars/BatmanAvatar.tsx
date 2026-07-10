'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion';
import { useGameStore, GameEvent } from '@/stores/gameStore';
import { soundEngine } from '@/lib/soundEngine';

// ─── Batman SVG ──────────────────────────────────────────────────
export const BatmanSVG = ({
  isAngry = false,
  isDefeated = false,
  isBlinking = false,
  isThinking = false,
}: {
  isAngry?: boolean;
  isDefeated?: boolean;
  isBlinking?: boolean;
  isThinking?: boolean;
}) => (
  <svg suppressHydrationWarning viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="batman-cowl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      <linearGradient id="batman-suit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="batman-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={isDefeated ? '#cbd5e1' : '#fcd3b6'} />
        <stop offset="100%" stopColor={isDefeated ? '#64748b' : '#d28a64'} />
      </linearGradient>

      <filter id="batman-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.7" />
      </filter>
      
      <filter id="batman-eye-glow">
        <feGaussianBlur stdDeviation={isAngry ? '3' : '1'} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Massive Cape Silhouette */}
    <path
      d="M 0 160 Q 40 90 80 90 Q 120 90 160 160 Z"
      fill="url(#batman-cowl)"
      filter="url(#batman-shadow)"
    />

    {/* Suit Chest */}
    <path
      d="M 30 160 L 50 120 L 110 120 L 130 160 Z"
      fill="url(#batman-suit)"
    />

    {/* Chest Muscle Definition */}
    <path d="M 80 120 L 80 160" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.6"/>
    <path d="M 50 145 Q 80 140 110 145" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.6"/>

    {/* Yellow Oval Symbol */}
    <ellipse cx="80" cy="130" rx="22" ry="14" fill="#fbbf24" opacity={isDefeated ? 0.3 : 1} filter="url(#batman-shadow)" />
    
    {/* Clean Black Bat Symbol inside Oval */}
    <path
      d="M 80 123 C 78 120 74 122 70 120 L 73 126 L 65 125 L 70 131 L 62 134 L 70 133 L 78 141 L 80 138 L 82 141 L 90 133 L 98 134 L 90 131 L 95 125 L 87 126 L 90 120 C 86 122 82 120 80 123 Z"
      fill="#020617"
      opacity={isDefeated ? 0.4 : 1}
    />

    {/* Thick Neck */}
    <rect x="58" y="90" width="44" height="35" fill="#0f172a" />
    <polygon points="58,90 102,90 80,110" fill="#020617" opacity="0.6" />

    {/* Head/Cowl Base */}
    <path
      d="M 40 45 L 55 20 Q 80 10 105 20 L 120 45 L 115 100 Q 80 115 45 100 Z"
      fill="url(#batman-cowl)"
      filter="url(#batman-shadow)"
    />

    {/* Blue Cowl Highlights (Classic Cartoon) */}
    <path
      d="M 45 45 Q 80 15 115 45 Q 80 30 45 45 Z"
      fill="#3b82f6"
      opacity="0.3"
    />
    <path
      d="M 40 45 L 55 20 Q 80 10 105 20 L 120 45 Q 80 20 40 45 Z"
      fill="#3b82f6"
      opacity="0.15"
    />

    {/* Sharp Ears */}
    <polygon points="40,45 35,0 55,20" fill="url(#batman-cowl)" />
    <polygon points="120,45 125,0 105,20" fill="url(#batman-cowl)" />
    {/* Ear Highlights */}
    <polygon points="40,45 35,0 45,20" fill="#3b82f6" opacity="0.3" />
    <polygon points="120,45 125,0 115,20" fill="#3b82f6" opacity="0.3" />

    {/* Exposed Lower Face */}
    <path
      d="M 55 65 Q 80 75 105 65 L 105 95 L 95 105 Q 80 110 65 105 L 55 95 Z"
      fill="url(#batman-face)"
    />

    {/* Face Shadow under Cowl Edge */}
    <path
      d="M 55 65 Q 80 75 105 65 L 105 70 Q 80 80 55 70 Z"
      fill="#000"
      opacity="0.25"
    />

    {/* Nose and Cheeks Cover from Cowl */}
    <path
      d="M 55 65 L 65 75 L 75 70 L 80 80 L 85 70 L 95 75 L 105 65 L 105 55 Q 80 60 55 55 Z"
      fill="url(#batman-cowl)"
    />
    <polygon points="75,70 80,80 85,70" fill="#020617" opacity="0.8"/> {/* Nose Tip Shadow */}

    {/* Angry Eyebrows/Brow Ridge */}
    <path d="M 40 45 L 80 65 L 120 45 L 115 40 Q 80 50 45 40 Z" fill="#020617" opacity="0.5" />

    {/* Angular Eye Sockets */}
    <polygon points="45,55 75,65 70,70 42,65" fill="#000" />
    <polygon points="115,55 85,65 90,70 118,65" fill="#000" />

    {/* Glowing White Eyes */}
    {!isBlinking && (
      <>
        <polygon
          points={isAngry ? "50,60 73,66 69,68 47,65" : "50,58 73,66 69,68 47,63"}
          fill={isDefeated ? '#475569' : '#ffffff'}
          filter={!isDefeated ? "url(#batman-eye-glow)" : ""}
        />
        <polygon
          points={isAngry ? "110,60 87,66 91,68 113,65" : "110,58 87,66 91,68 113,63"}
          fill={isDefeated ? '#475569' : '#ffffff'}
          filter={!isDefeated ? "url(#batman-eye-glow)" : ""}
        />
      </>
    )}

    {/* Blink Lids */}
    {isBlinking && (
      <>
        <polygon points="48,60 74,67 70,68 46,65" fill="#020617" />
        <polygon points="112,60 86,67 90,68 114,65" fill="#020617" />
      </>
    )}

    {/* Expressive Mouth */}
    {isDefeated ? (
      <path d="M 68 98 Q 80 92 92 98" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ) : isThinking ? (
      <path d="M 72 95 L 88 95" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ) : (
      <>
        <path d="M 65 92 Q 80 96 95 92" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
        {isAngry && <path d="M 70 94 Q 80 96 90 94" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.9"/>}
      </>
    )}

    {/* Cleft Chin */}
    <line x1="80" y1="100" x2="80" y2="105" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Particle Effects ────────────────────────────────────────────
const BatarangParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute w-6 h-2 pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 1, scale: 0.5, rotate: 0 }}
    animate={{ opacity: 0, scale: 1.5, x: 80, y: -40, rotate: 720 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
  >
    <svg viewBox="0 0 24 8" width="24" height="8">
      <path d="M 2 4 L 12 0 L 22 4 L 12 8 Z" fill="#94a3b8" />
    </svg>
  </motion.div>
);

// ─── Reaction configs ────────────────────────────────────────────
type ReactionConfig = {
  animation: TargetAndTransition;
  transition: Transition;
  sound?: () => void;
  loop?: boolean;
  isAngry?: boolean;
  isDefeated?: boolean;
  isThinking?: boolean;
  throwBatarang?: boolean;
};

function getReaction(event: GameEvent): ReactionConfig | null {
  switch (event) {
    case 'game-start':
      return {
        animation: { scale: [0.5, 1.2, 1], y: [-150, 10, 0], opacity: [0, 1, 1] },
        transition: { duration: 0.8, times: [0, 0.7, 1], ease: 'easeOut' },
        sound: () => soundEngine.batGrapple(),
        isAngry: true,
      };
    case 'thinking':
      return {
        animation: { scale: [1, 1.02, 1], y: [0, -2, 0] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        isThinking: true,
      };
    case 'ai-move':
      return {
        animation: { y: [0, -10, 0], scale: [1, 1.05, 1] },
        transition: { duration: 0.4 },
      };
    case 'player-move':
      return {
        animation: { rotate: [0, -3, 3, 0] },
        transition: { duration: 0.3 },
      };
    case 'player-capture':
      return {
        animation: { x: [-5, 5, -3, 3, 0], scale: [1, 0.95, 1] },
        transition: { duration: 0.4 },
      };
    case 'capture':
      return {
        animation: { scale: [1, 1.1, 1], x: [0, -10, 0], rotate: [0, -10, 0] },
        transition: { duration: 0.5 },
        sound: () => soundEngine.batarangSwoosh(),
        throwBatarang: true,
      };
    case 'player-check':
      return {
        animation: { scale: [1, 0.9, 1.05, 1], y: [0, 10, -5, 0] },
        transition: { duration: 0.5 },
      };
    case 'check':
      return {
        animation: { scale: [1, 1.2, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] },
        transition: { duration: 0.6 },
        sound: () => soundEngine.playBatSignal(),
        isAngry: true,
      };
    case 'checkmate':
      return {
        animation: { scale: [1, 1.5, 1.4], y: [0, -30, -20], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1.2)'] },
        transition: { duration: 1.5 },
        sound: () => soundEngine.playBatSignal(),
        isAngry: true,
      };
    case 'win':
      return {
        animation: { scale: [1, 0.9, 0.7, 0.5], opacity: [1, 0.8, 0.4, 0], y: [0, 10, 30, 50] },
        transition: { duration: 2, ease: 'easeIn' },
        isDefeated: true,
      };
    case 'loss':
      return {
        animation: { scale: [1, 1.2, 1.1, 1.2], y: [0, -15, -10, -15], filter: ['brightness(1)', 'brightness(0.2)', 'brightness(0.3)', 'brightness(0.2)'] },
        transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' },
        sound: () => soundEngine.playBatSignal(),
      };
    case 'stalemate':
      return {
        animation: { scale: [1, 0.98, 1], rotate: [0, 2, -2, 0] },
        transition: { duration: 0.8 },
        isThinking: true,
      };
    default:
      return null;
  }
}

// ─── Component ──────────────────────────────────────────────────
export default function BatmanAvatar({ preview = false }: { preview?: boolean }) {
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
  const [isThinking, setIsThinking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showBatarang, setShowBatarang] = useState(false);
  
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

    setIsAngry(!!reaction.isAngry);
    setIsDefeated(!!reaction.isDefeated);
    setIsThinking(!!reaction.isThinking);

    if (reaction.throwBatarang) {
      setShowBatarang(true);
      setTimeout(() => setShowBatarang(false), 600);
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
      {showBatarang && (
        <BatarangParticle x={80} y={100} delay={0} />
      )}

      <motion.div
        key={animKey}
        animate={currentAnim ?? { y: [0, -4, 0], scale: [1, 1.01, 1] }}
        transition={currentTransition ?? { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (currentAnim && !isLooping && lastEvent !== 'thinking' && lastEvent !== 'stalemate') {
            setCurrentAnim(null);
            setCurrentTransition(null);
            setIsAngry(false);
            setIsDefeated(false);
            setIsThinking(false);
          }
        }}
        className="relative"
      >
        <div className="flex items-center justify-center w-[160px] h-[160px]">
          <BatmanSVG 
            isAngry={isAngry} 
            isDefeated={isDefeated} 
            isBlinking={isBlinking} 
            isThinking={isThinking} 
          />
        </div>
      </motion.div>

      {/* Shadow background element when defeated */}
      {isDefeated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute inset-0 rounded-full bg-slate-900 blur-2xl -z-10"
        />
      )}
    </div>
  );
}
