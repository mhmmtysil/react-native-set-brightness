/** Reject near-zero / invalid readings so we never "restore" to pitch black. */
export function isValidBrightness(b: unknown): b is number {
  return typeof b === 'number' && Number.isFinite(b) && b > 0.05 && b <= 1;
}

export function clampBrightness(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}
