/**
 * Internationalization system for ChessGround.
 * Supports: English (en), Russian (ru)
 */
import { create } from 'zustand';

export type Language = 'en' | 'ru';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
}));

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.language': 'Language',

    // Landing / Lobby
    'lobby.title': 'ChessGround',
    'lobby.subtitle': 'Challenge unique AI opponents in chess',
    'lobby.playNow': 'Play Now',
    'lobby.howToPlay': 'How to Play',
    'lobby.step1': 'Choose your opponent',
    'lobby.step2': 'Set difficulty level',
    'lobby.step3': 'Play and win!',
    'lobby.opponents': 'Meet Your Opponents',

    // Select
    'select.title': 'Choose Your Opponent',
    'select.subtitle': 'Each opponent has a unique personality and play style',
    'select.difficulty': 'Set Difficulty',
    'select.diffLabel': 'Difficulty',
    'select.startGame': 'Start Game',
    'select.selectOpponent': 'Select an opponent first',
    'select.preparing': 'Preparing...',

    // Difficulty levels
    'diff.1': 'Beginner',
    'diff.2': 'Easy',
    'diff.3': 'Medium',
    'diff.4': 'Hard',
    'diff.5': 'Master',

    // Opponents
    'opponent.trex.name': 'Rex the Destroyer',
    'opponent.trex.title': 'The Aggressive Hunter',
    'opponent.trex.desc': 'An aggressive player who loves captures. Rex never backs down from a fight!',
    'opponent.elephant.name': 'Ellie the Wise',
    'opponent.elephant.title': 'The Gentle Strategist',
    'opponent.elephant.desc': 'A calm and thoughtful opponent. Perfect for learning chess strategy.',
    'opponent.creeper.name': 'Creeper',
    'opponent.creeper.title': 'The Unpredictable',
    'opponent.creeper.desc': 'Explosive and unpredictable! You never know what Creeper will do next.',
    'opponent.ninja.name': 'Kai the Red Ninja',
    'opponent.ninja.title': 'The Grand Master',
    'opponent.ninja.desc': 'Lightning-fast calculations and deadly precision. Only the brave dare challenge Kai!',

    // Play
    'play.turn': 'Turn',
    'play.vs': 'vs',
    'play.newGame': 'New Game',
    'play.changeOpponent': 'Change Opponent',
    'play.yourTurn': 'Your Turn',
    'play.thinking': 'is thinking...',
    'play.gameOver': 'Game Over',
    'play.captured': 'Captured',
    'play.moves': 'Moves',
    'play.you': 'You',
    'play.ai': 'AI',
    'play.noMoves': 'No moves yet...',
    'play.youWin': 'You win!',
    'play.checkmate': 'Checkmate!',
    'play.draw': 'Draw!',
    'play.moveHistory': 'Move History',
    'play.resignLoss': 'Loss (Resigned)',
    'play.choosePiece': 'Choose a piece',
    'play.cancel': 'Cancel',
    'play.readyToPlay': 'Ready to play!',
    'play.resign': 'Resign',
    'play.undoMove': 'Undo Move',
    'play.undo': 'Undo',
  },
  ru: {
    // Navbar
    'nav.home': 'Главная',
    'nav.language': 'Язык',

    // Landing / Lobby
    'lobby.title': 'ChessGround',
    'lobby.subtitle': 'Бросьте вызов уникальным ИИ-противникам в шахматах',
    'lobby.playNow': 'Играть',
    'lobby.howToPlay': 'Как играть',
    'lobby.step1': 'Выберите противника',
    'lobby.step2': 'Настройте сложность',
    'lobby.step3': 'Играйте и побеждайте!',
    'lobby.opponents': 'Ваши противники',

    // Select
    'select.title': 'Выберите противника',
    'select.subtitle': 'Каждый противник уникален по стилю игры',
    'select.difficulty': 'Уровень сложности',
    'select.diffLabel': 'Сложность',
    'select.startGame': 'Начать игру',
    'select.selectOpponent': 'Сначала выберите противника',
    'select.preparing': 'Подготовка...',

    // Difficulty levels
    'diff.1': 'Новичок',
    'diff.2': 'Легко',
    'diff.3': 'Средне',
    'diff.4': 'Сложно',
    'diff.5': 'Мастер',

    // Opponents
    'opponent.trex.name': 'Рекс-разрушитель',
    'opponent.trex.title': 'Агрессивный охотник',
    'opponent.trex.desc': 'Агрессивный игрок, который любит захватывать фигуры. Рекс никогда не отступает!',
    'opponent.elephant.name': 'Элли Мудрая',
    'opponent.elephant.title': 'Нежный стратег',
    'opponent.elephant.desc': 'Спокойный и вдумчивый противник. Идеален для изучения шахматной стратегии.',
    'opponent.creeper.name': 'Крипер',
    'opponent.creeper.title': 'Непредсказуемый',
    'opponent.creeper.desc': 'Взрывной и непредсказуемый! Никогда не знаешь, что Крипер сделает дальше.',
    'opponent.ninja.name': 'Кай — Красный Ниндзя',
    'opponent.ninja.title': 'Великий мастер',
    'opponent.ninja.desc': 'Молниеносные расчёты и смертельная точность. Только смелые бросят вызов Каю!',

    // Play
    'play.turn': 'Ход',
    'play.vs': 'против',
    'play.newGame': 'Новая игра',
    'play.changeOpponent': 'Сменить противника',
    'play.yourTurn': 'Ваш ход',
    'play.thinking': 'думает...',
    'play.gameOver': 'Игра окончена',
    'play.captured': 'Захваченные',
    'play.moves': 'Ходы',
    'play.you': 'Вы',
    'play.ai': 'ИИ',
    'play.noMoves': 'Ходов пока нет...',
    'play.youWin': 'Вы победили!',
    'play.checkmate': 'Мат!',
    'play.draw': 'Ничья!',
    'play.moveHistory': 'История ходов',
    'play.resignLoss': 'Поражение (Сдался)',
    'play.choosePiece': 'Выберите фигуру',
    'play.cancel': 'Отмена',
    'play.readyToPlay': 'Готов к игре!',
    'play.resign': 'Сдаться',
    'play.undoMove': 'Отменить ход',
    'play.undo': 'Назад',
  },
};

/** Translation function — returns translated string for current language */
export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

/** Hook for easy translation access */
export function useTranslation() {
  const language = useI18n((s) => s.language);
  return {
    t: (key: string) => t(key, language),
    language,
    setLanguage: useI18n.getState().setLanguage,
  };
}
