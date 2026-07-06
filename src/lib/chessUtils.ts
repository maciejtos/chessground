export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function calculateMaterialAdvantage(whiteCaptures: string[], blackCaptures: string[]) {
  // whiteCaptures = white pieces that were captured (i.e., Black's trophies)
  // blackCaptures = black pieces that were captured (i.e., White's trophies)
  const whiteScoreGained = blackCaptures.reduce((sum, piece) => sum + (PIECE_VALUES[piece.toLowerCase()] || 0), 0);
  const blackScoreGained = whiteCaptures.reduce((sum, piece) => sum + (PIECE_VALUES[piece.toLowerCase()] || 0), 0);

  return {
    whiteAdvantage: whiteScoreGained > blackScoreGained ? whiteScoreGained - blackScoreGained : 0,
    blackAdvantage: blackScoreGained > whiteScoreGained ? blackScoreGained - whiteScoreGained : 0,
  };
}
