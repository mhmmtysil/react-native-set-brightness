import {NativeModules, Platform, TurboModuleRegistry} from 'react-native';
import type {Spec} from './NativeAppBrightness';

type NativeShape = {
  getBrightness(): Promise<number>;
  setBrightness(value: number): Promise<void>;
  getAppBrightness(): Promise<number>;
  setAppBrightness(value: number): Promise<void>;
  restoreSystemBrightness(): Promise<void>;
};

function resolveNative(): NativeShape {
  // Prefer TurboModule when New Architecture / codegen is on.
  try {
    const turbo = TurboModuleRegistry.get<Spec>('AppBrightness');
    if (turbo) {
      return turbo;
    }
  } catch {
    // fall through to classic NativeModules (interop / old arch)
  }

  const classic = NativeModules.AppBrightness as NativeShape | undefined;
  if (!classic) {
    const hint =
      Platform.OS === 'ios'
        ? 'Run pod install and rebuild the iOS app.'
        : 'Rebuild the Android app so autolinking registers AppBrightnessPackage.';
    throw new Error(
      `[react-native-set-brightness] Native module "AppBrightness" is null. ${hint}`,
    );
  }
  return classic;
}

export const NativeAppBrightness: NativeShape = resolveNative();
