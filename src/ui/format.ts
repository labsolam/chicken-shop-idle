/**
 * AGENT CONTEXT: Number formatting utilities for the game UI.
 * formatMoney converts cents to a human-readable dollar string.
 * Adapts as numbers grow:
 *   $0–$999.99      → "$123.45"
 *   $1K–$999.99K    → "$123.45K"
 *   $1M–$999.99M    → "$123.45M"
 *   $1B–$999.99B    → "$123.45B"
 *   $1T–$999.99T    → "$123.45T"
 *   $1Qa+           → scientific notation "$1.23e15"
 * All input values are in cents (integers).
 */

const THOUSAND = 100_000; // cents in $1K
const MILLION = 100_000_000; // cents in $1M
const BILLION = 100_000_000_000; // cents in $1B
const TRILLION = 100_000_000_000_000; // cents in $1T
const QUADRILLION = 100_000_000_000_000_000; // cents in $1Qa

export function formatMoney(cents: number): string {
  if (cents < THOUSAND) {
    return `$${(cents / 100).toFixed(2)}`;
  }
  if (cents < MILLION) {
    return `$${(cents / THOUSAND).toFixed(2)}K`;
  }
  if (cents < BILLION) {
    return `$${(cents / MILLION).toFixed(2)}M`;
  }
  if (cents < TRILLION) {
    return `$${(cents / BILLION).toFixed(2)}B`;
  }
  if (cents < QUADRILLION) {
    return `$${(cents / TRILLION).toFixed(2)}T`;
  }
  // Scientific notation for very large numbers
  const dollars = cents / 100;
  return `$${dollars.toExponential(2)}`;
}

/** Formats a plain number for display (no currency symbol). */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}
