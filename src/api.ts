import {Platform} from 'react-native';
import {NativeAppBrightness} from './native';
import {clampBrightness} from './utils';

/**
 * Read current brightness.
 * - iOS: UIScreen brightness (0–1)
 * - Android: window brightness if overridden (>=0), else system brightness as read-only (no WRITE_SETTINGS)
 */
export function getBrightness(): Promise<number> {
  return NativeAppBrightness.getBrightness();
}

/**
 * Set brightness (0–1).
 * - iOS: UIScreen
 * - Android: **window / app** brightness only (not Settings.System)
 */
export async function setBrightness(value: number): Promise<void> {
  await NativeAppBrightness.setBrightness(clampBrightness(value));
}

/**
 * Window / activity brightness.
 * Android: LayoutParams.screenBrightness (−1 means follow system when reading may return −1).
 * iOS: aliases getBrightness / setBrightness.
 */
export function getAppBrightness(): Promise<number> {
  return NativeAppBrightness.getAppBrightness();
}

export async function setAppBrightness(value: number): Promise<void> {
  // Android restore uses −1; allow that through unclamped.
  if (Platform.OS === 'android' && value < 0) {
    await NativeAppBrightness.setAppBrightness(value);
    return;
  }
  await NativeAppBrightness.setAppBrightness(clampBrightness(value));
}

/**
 * Hand control back to the OS.
 * - Android: window screenBrightness = −1 (follow system)
 * - iOS: no system "follow" API — native no-op; use boost helpers to restore a saved value
 */
export function restoreSystemBrightness(): Promise<void> {
  return NativeAppBrightness.restoreSystemBrightness();
}
