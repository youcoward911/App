// Peek pricing (mirrored in SharedDefaults.swift `currentPeekCost` for the block screen):
// Pro's first peek per lock is free, then each peek costs 20%, 30%, 40%… of the
// full-unlock fee, capped at 100%.
export function getPeekPercent(peekCount) {
  return Math.min(100, 10 + 10 * peekCount);
}

export function getPeekCost(peekCount, fullFee, isPro) {
  if (isPro && peekCount === 0) return 0;
  return Math.max(1, Math.round((fullFee * getPeekPercent(peekCount)) / 100));
}
