/**
 * AGENT CONTEXT: Idle diminishing returns for Phase 3.
 * After 8h continuous idle, earnings ramp down linearly from 100% to 60% over 2h.
 * After 10h continuous idle, earnings cap at 60%.
 * continuousIdleMs is tracked by tick() and reset on any player click.
 * Pure function — no side effects.
 */

/** 8 hours in ms */
const IDLE_RAMP_START_MS = 8 * 60 * 60 * 1000;

/** 10 hours in ms */
const IDLE_RAMP_END_MS = 10 * 60 * 60 * 1000;

/** Efficiency before the ramp (before 8h = 100%) */
const EFFICIENCY_FULL = 1.0;

/** Efficiency cap after the ramp (after 10h = 60%) */
const EFFICIENCY_MIN = 0.6;

/**
 * Returns the idle efficiency multiplier based on continuous idle time.
 * - Before 8h: 1.0 (100%)
 * - 8h to 10h: linear ramp from 1.0 to 0.6 (no step discontinuity)
 * - After 10h: 0.6 (60%)
 */
export function getIdleEfficiency(continuousIdleMs: number): number {
  if (continuousIdleMs <= IDLE_RAMP_START_MS) {
    return EFFICIENCY_FULL;
  }

  if (continuousIdleMs >= IDLE_RAMP_END_MS) {
    return EFFICIENCY_MIN;
  }

  // Linear interpolation between 1.0 and 0.6 over the 2h window
  const rampDuration = IDLE_RAMP_END_MS - IDLE_RAMP_START_MS;
  const elapsed = continuousIdleMs - IDLE_RAMP_START_MS;
  const t = elapsed / rampDuration;
  return EFFICIENCY_FULL - t * (EFFICIENCY_FULL - EFFICIENCY_MIN);
}
