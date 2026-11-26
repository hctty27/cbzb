// Re-exported from AllLevelsData for backward compatibility
import { ALL_LEVELS_BY_ID, CAMPAIGN_LEVELS, getLevelById } from './AllLevelsData';
import { LevelDef } from './Types';

export const WESTARIA_LEVELS: LevelDef[] = CAMPAIGN_LEVELS.Westaria;
export const WESTARIA_LEVELS_BY_ID: Record<number, LevelDef> = ALL_LEVELS_BY_ID;

export function getWestariaLevel(id: number): LevelDef {
  return getLevelById(id);
}
