import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

/**
 * Native contract.
 * Android: window (LayoutParams.screenBrightness) only — never WRITE_SETTINGS.
 * iOS: UIScreen.main.brightness.
 */
export interface Spec extends TurboModule {
  getBrightness(): Promise<number>;
  setBrightness(value: number): Promise<void>;
  getAppBrightness(): Promise<number>;
  setAppBrightness(value: number): Promise<void>;
  restoreSystemBrightness(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AppBrightness');
