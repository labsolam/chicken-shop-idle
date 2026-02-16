import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Core game tick function.
 * Currently a no-op — idle cooking is disabled in favor of the clicker flow.
 * Kept for future idle mechanics.
 */
export function tick(state: GameState, _deltaMs: number): GameState {
  return { ...state };
}
