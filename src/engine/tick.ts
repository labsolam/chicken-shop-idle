import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Core game tick function.
 * Pure function: takes current state + elapsed milliseconds, returns new state.
 * Handles cooking progress, chicken production, and offline catch-up.
 * Does NOT handle selling — that is a separate player action (see sell.ts).
 */
export function tick(state: GameState, deltaMs: number): GameState {
  if (!state.shopOpen) {
    return { ...state };
  }

  const deltaSeconds = deltaMs / 1000;
  const progressGained = deltaSeconds / state.cookTimeSeconds;
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
