import { GameState } from "../types/game-state";
import { getRecipe } from "./recipes";

/**
 * AGENT CONTEXT: Manual click-to-cook actions (Phase 1).
 * Pure functions: queues raw chickens for cooking.
 * clickCook queues 1 cook job for the active recipe (consumes rawInput raw chickens).
 * clickCookBatch queues multiple cook jobs.
 * Cooking completes over time via tick(). No-op if insufficient raw chickens.
 */

/** Queues 1 cook job for the active recipe. Consumes rawInput raw chickens. */
export function clickCook(state: GameState): GameState {
  const recipe = getRecipe(state.activeRecipe);
  if (state.chickensBought < recipe.rawInput) {
    return { ...state };
  }

  return {
    ...state,
    chickensBought: state.chickensBought - recipe.rawInput,
    cookingCount: state.cookingCount + 1,
  };
}

/**
 * Queues up to `quantity` cook jobs for the active recipe.
 * Each job consumes rawInput raw chickens.
 * Actual jobs = min(quantity, floor(chickensBought / rawInput)).
 */
export function clickCookBatch(state: GameState, quantity: number): GameState {
  const recipe = getRecipe(state.activeRecipe);
  const maxJobs = Math.floor(state.chickensBought / recipe.rawInput);
  const actualJobs = Math.min(quantity, maxJobs);

  if (actualJobs <= 0) {
    return { ...state };
  }

  return {
    ...state,
    chickensBought: state.chickensBought - actualJobs * recipe.rawInput,
    cookingCount: state.cookingCount + actualJobs,
  };
}

/**
 * Changes the active recipe. Only succeeds if the recipe is in unlockedRecipes.
 * Does NOT change cookingRecipeId — in-progress cooking finishes at the old recipe's time.
 * tick() syncs cookingRecipeId to activeRecipe when cookingCount reaches 0.
 */
export function selectRecipe(state: GameState, recipeId: string): GameState {
  if (!state.unlockedRecipes.includes(recipeId)) {
    return { ...state };
  }

  return {
    ...state,
    activeRecipe: recipeId,
  };
}
