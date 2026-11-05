import {AppState, type AppStateStatus, Platform} from 'react-native';
import {
  getBrightness,
  restoreSystemBrightness,
  setAppBrightness,
  setBrightness,
} from './api';
import {isValidBrightness} from './utils';

export type BoostBrightnessOptions = {
  /** Target level while boosted (default 1). */
  maxLevel?: number;
  /** Delay before re-boost after AppState becomes active (default 300ms). iOS often reports stale/0 right after resume. */
  resumeDelayMs?: number;
  /** Fallback restore level on iOS when no valid saved reading exists (default 0.5). */
  iosFallbackLevel?: number;
};

type ControllerState = {
  savedBrightness: number | null;
  boosted: boolean;
};

/**
 * Imperative controller for temporary max brightness:
 * save (iOS) → max → restore on background → delayed re-boost on active.
 * Module-level state is optional via createBoostBrightnessController().
 */
export function createBoostBrightnessController(
  options: BoostBrightnessOptions = {},
) {
  const maxLevel = options.maxLevel ?? 1;
  const resumeDelayMs = options.resumeDelayMs ?? 300;
  const iosFallbackLevel = options.iosFallbackLevel ?? 0.5;
  const isAndroid = Platform.OS === 'android';

  const state: ControllerState = {
    savedBrightness: null,
    boosted: false,
  };

  let mounted = false;
  let boostTimer: ReturnType<typeof setTimeout> | null = null;
  let appStateSub: {remove: () => void} | null = null;

  const clearBoostTimer = () => {
    if (boostTimer) {
      clearTimeout(boostTimer);
      boostTimer = null;
    }
  };

  const setLevel = (v: number) =>
    (isAndroid ? setAppBrightness(v) : setBrightness(v)).catch(() => {});

  const restore = (final: boolean = false) => {
    clearBoostTimer();
    if (state.boosted) {
      state.boosted = false;
      if (isAndroid) {
        // Hand window brightness back to the system.
        restoreSystemBrightness().catch(() => setLevel(-1));
      } else {
        setLevel(
          isValidBrightness(state.savedBrightness)
            ? state.savedBrightness
            : iosFallbackLevel,
        );
      }
    }
    if (final) {
      state.savedBrightness = null;
    }
  };

  const setMax = async () => {
    if (!mounted || AppState.currentState !== 'active') {
      return;
    }
    // Read the original only when not boosted and no valid saved value exists (iOS).
    if (!isAndroid && !state.boosted && !isValidBrightness(state.savedBrightness)) {
      try {
        const b = await getBrightness();
        if (
          mounted &&
          !state.boosted &&
          AppState.currentState === 'active' &&
          isValidBrightness(b)
        ) {
          state.savedBrightness = b;
        }
      } catch {
        // ignore read failures; still attempt boost
      }
      if (!mounted || AppState.currentState !== 'active') {
        return;
      }
    }
    state.boosted = true;
    setLevel(maxLevel);
  };

  const onAppState = (nextState: AppStateStatus) => {
    if (nextState === 'background' || nextState === 'inactive') {
      restore(false);
    }
    if (nextState === 'active') {
      clearBoostTimer();
      boostTimer = setTimeout(() => {
        boostTimer = null;
        setMax();
      }, resumeDelayMs);
    }
  };

  return {
    /** Start listening + boost. Call once when the screen that needs max brightness mounts. */
    start() {
      if (mounted) {
        return;
      }
      mounted = true;
      setMax();
      appStateSub = AppState.addEventListener('change', onAppState);
    },
    /** Stop listening and restore permanently. Call on unmount. */
    stop() {
      if (!mounted) {
        return;
      }
      mounted = false;
      appStateSub?.remove();
      appStateSub = null;
      restore(true);
    },
    /** Force max now (respects mounted + active). */
    boost: setMax,
    /** Temporary restore (keeps savedBrightness for return). */
    dim: () => restore(false),
    getState: () => ({...state}),
  };
}

export type BoostBrightnessController = ReturnType<
  typeof createBoostBrightnessController
>;
