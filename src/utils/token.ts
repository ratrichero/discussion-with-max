/**
 * Estimate the number of tokens in a text string.
 * Rule of thumb: ~4 characters per token for English/Vietnamese text.
 * This is a rough estimate used for display purposes only.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
