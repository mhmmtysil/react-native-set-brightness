import {useEffect, useRef} from 'react';
import {
  createBoostBrightnessController,
  type BoostBrightnessOptions,
  type BoostBrightnessController,
} from './boost';

/**
 * While the host screen is mounted, boost brightness to max and restore on blur/background.
 * Boost while focused; restore on blur/background (default resumeDelayMs 300).
 */
export function useMaxBrightnessWhileFocused(
  options: BoostBrightnessOptions & {enabled?: boolean} = {},
): BoostBrightnessController {
  const {enabled = true, ...boostOptions} = options;
  const controllerRef = useRef<BoostBrightnessController | null>(null);

  if (controllerRef.current == null) {
    controllerRef.current = createBoostBrightnessController(boostOptions);
  }

  useEffect(() => {
    const controller = controllerRef.current!;
    if (!enabled) {
      controller.stop();
      return;
    }
    controller.start();
    return () => {
      controller.stop();
    };
    // options object identity is ignored; pass stable enabled / recreate via key if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return controllerRef.current;
}
