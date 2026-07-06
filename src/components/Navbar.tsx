'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n, useTranslation, type Language } from '@/lib/i18n';
import { useGameStore } from '@/stores/gameStore';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const setLanguage = useI18n((s) => s.setLanguage);
  const [langOpen, setLangOpen] = useState(false);
  const rawOpponentName = useGameStore((s) => s.opponentName);
  const rawDifficulty = useGameStore((s) => s.difficulty);

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const opponentName = mounted ? rawOpponentName : 'Rex the Destroyer';
  const difficulty = mounted ? rawDifficulty : 1;

  const currentLang = languages.find((l) => l.code === language) || languages[0];
  const isHome = pathname === '/';
  const isPlay = pathname === '/play';

  return (
    <nav className="z-50 flex items-center justify-between px-4 sm:px-6 py-2 bg-white/80 backdrop-blur-xl border-b-4 border-white shrink-0 h-[60px] shadow-sm">
      {/* Left: Logo + Home */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 group btn-bouncy"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-inner border-b-4 border-blue-600">
            <span className="text-2xl text-white drop-shadow-md">♞</span>
          </div>
          <span className="text-lg font-black tracking-tight text-blue-900 hidden sm:block">
            ChessGround
          </span>
        </button>

        {!isHome && (
          <div className="hidden sm:flex items-center gap-2 pl-6 border-l-2 border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors font-bold text-gray-700 btn-bouncy shadow-sm text-sm h-[40px]"
            >
              {t('nav.home')}
            </button>
          </div>
        )}
      </div>

      {/* Center: Vs Opponent (only on play page) */}
      {isPlay && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="text-sm font-black text-gray-500 uppercase tracking-widest">{t('play.vs')}</span>
          <span className="text-lg font-black text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full border-2 border-blue-200">
            {opponentName}
          </span>
          <div className="hidden sm:flex items-center">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full border-2 border-gray-200 ml-1">
              {t(`diff.${difficulty}`) || `Level ${difficulty}`}
            </span>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-4 relative">
        {isPlay && (
          <button
            onClick={() => router.push('/select')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors font-bold text-gray-700 btn-bouncy shadow-sm text-sm h-[40px] hidden sm:block"
          >
            {t('play.changeOpponent')}
          </button>
        )}
        
        <div className="relative">
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center justify-center gap-2 px-4 bg-white rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors font-bold text-gray-700 btn-bouncy shadow-sm h-[40px]"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm hidden sm:block">{currentLang.label}</span>
          <svg suppressHydrationWarning width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 text-gray-400 ${langOpen ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <AnimatePresence>
          {langOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 top-full mt-2 py-2 bg-white border-4 border-gray-100 rounded-2xl shadow-xl min-w-[120px] overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                     setLanguage(lang.code);
                     setLangOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                    language === lang.code
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close */}
        {langOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setLangOpen(false)}
          />
        )}
      </div>
      </div>
    </nav>
  );
}
