/**
 * AGENT CONTEXT: Idle diminishing returns for Phase 3.
 * After 8h continuous idle, earnings drop to 80% over 2h ramp.
 * After 10h continuous idle, earnings cap at 60%.
 * continuousIdleMs is tracked by tick() and reset on any player click.
 * Pure function — no side effects.
 */

/** 8 hours in ms */
const IDLE_RAMP_START_MS = 8 * 60 * 60 * 1000;

/** 10 hours in ms */
const IDLE_RAMP_END_MS = 10 * 60 * 60 * 1000;

/** Efficiency at the start of the ramp (before 8h = 100%) */
const EFFICIENCY_FULL = 1.0;

/** Efficiency at the end of the ramp (after 10h) */
const EFFICIENCY_MIN = 0.6;

/** Efficiency at the start of the diminishing zone (8h) */
const EFFICIENCY_AT_RAMP_START = 0.8;

/**
 * Returns the idle efficiency multiplier based on continuous idle time.
 * - Before 8h: 1.0 (100%)
 * - 8h to 10h: linear ramp from 0.8 to 0.6
 * - After 10h: 0.6 (60%)
 */
export function getIdleEfficiency(continuousIdleMs: number): number {
  if (continuousIdleMs <= IDLE_RAMP_START_MS) {
    return EFFICIENCY_FULL;
  }

  if (continuousIdleMs >= IDLE_RAMP_END_MS) {
    return EFFICIENCY_MIN;
  }

  // Linear interpolation between 0.8 and 0.6 over the 2h window
  const rampDuration = IDLE_RAMP_END_MS - IDLE_RAMP_START_MS;
  const elapsed = continuousIdleMs - IDLE_RAMP_START_MS;
  const t = elapsed / rampDuration;
  return (
    EFFICIENCY_AT_RAMP_START - t * (EFFICIENCY_AT_RAMP_START - EFFICIENCY_MIN)
  );
}
