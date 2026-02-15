import { GameState } from "../types/game-state";
import { getEffectiveCookTime } from "./buy";

/**
 * AGENT CONTEXT: Core game tick function.
 * Pure function: takes current state + elapsed milliseconds, returns new state.
 * Handles cooking progress, chicken production, and offline catch-up.
 * Does NOT handle selling — that is a separate player action (see sell.ts).
 * Cook time is modified by cookSpeedLevel via getEffectiveCookTime.
 */
export function tick(state: GameState, deltaMs: number): GameState {
  if (!state.shopOpen) {
    return { ...state };
  }

  const effectiveCookTime = getEffectiveCookTime(
    state.cookTimeSeconds,
    state.cookSpeedLevel,
  );
  const deltaSeconds = deltaMs / 1000;
  const progressGained = deltaSeconds / effectiveCookTime;
  const totalProgress = state.cookingProgress + progressGained;

  const chickensProduced = Math.floor(totalProgress);
  const remainingProgress = totalProgress - chickensProduced;

  return {
    ...state,
    cookingProgress: remainingProgress,
    chickensReady: state.chickensReady + chickensProduced,
    totalChickensCooked: state.totalChickensCooked + chickensProduced,
  };
}
