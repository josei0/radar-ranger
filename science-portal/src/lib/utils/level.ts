/**
 * Utility functions for calculating levels from XP.
 * 
 * Leveling Logic: 
 * Every 100 XP is 1 level.
 * Level 1: 0 - 99 XP
 * Level 2: 100 - 199 XP
 * Level 3: 200 - 299 XP
 */

export const XP_PER_LEVEL = 100;

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export function calculateLevel(xp: number): LevelInfo {
  const safeXp = Math.max(0, xp);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = safeXp % XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / XP_PER_LEVEL) * 100));

  return {
    level,
    currentXp: safeXp,
    xpForNextLevel: XP_PER_LEVEL - currentLevelXp,
    progressPercent,
  };
}
