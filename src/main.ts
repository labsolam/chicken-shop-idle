import { createInitialState } from "./types/game-state";
import { tick } from "./engine/tick";
import { sellChickens } from "./engine/sell";
import { render } from "./ui/render";

/**
 * AGENT CONTEXT: Application entry point.
 * Sets up the game loop (requestAnimationFrame) and wires UI events.
 * Game state lives here as a single mutable reference — all updates
 * go through pure engine functions that return new state objects.
 */

let state = createInitialState();
state.lastUpdateTimestamp = performance.now();

function gameLoop(currentTime: number): void {
  const deltaMs = currentTime - state.lastUpdateTimestamp;
  state = tick(state, deltaMs);
  state = { ...state, lastUpdateTimestamp: currentTime };
  render(state);
  requestAnimationFrame(gameLoop);
}

function onSellClick(): void {
  state = sellChickens(state);
  render(state);
}

const sellButton = document.getElementById("sell-button");
if (sellButton) {
  sellButton.addEventListener("click", onSellClick);
}

render(state);
requestAnimationFrame(gameLoop);
