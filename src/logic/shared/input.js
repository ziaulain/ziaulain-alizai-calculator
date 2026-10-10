/** Preserve decimal text; reject edits that could silently change its meaning. */
export function sanitizeNumericInput(candidate, previous = '') {
  const cleaned = candidate.replace(/[$,\s]/g, '');
  return /^\d*(?:\.\d*)?$/.test(cleaned) ? cleaned : previous;
}

