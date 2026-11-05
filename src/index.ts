export {
  getBrightness,
  setBrightness,
  getAppBrightness,
  setAppBrightness,
  restoreSystemBrightness,
} from './api';

export {isValidBrightness, clampBrightness} from './utils';

export {
  createBoostBrightnessController,
  type BoostBrightnessController,
  type BoostBrightnessOptions,
} from './boost';

export {useMaxBrightnessWhileFocused} from './useMaxBrightnessWhileFocused';

/** Default object export for drop-in familiarity with older brightness libs. */
import * as api from './api';
import {createBoostBrightnessController} from './boost';
import {useMaxBrightnessWhileFocused} from './useMaxBrightnessWhileFocused';
import {clampBrightness, isValidBrightness} from './utils';

const AppBrightness = {
  ...api,
  createBoostBrightnessController,
  useMaxBrightnessWhileFocused,
  isValidBrightness,
  clampBrightness,
};

export default AppBrightness;
