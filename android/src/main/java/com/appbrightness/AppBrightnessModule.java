package com.appbrightness;

import android.app.Activity;
import android.provider.Settings;
import android.view.WindowManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * App / window brightness only.
 * Never writes Settings.System.SCREEN_BRIGHTNESS (no WRITE_SETTINGS).
 * Restore uses LayoutParams.BRIGHTNESS_OVERRIDE_NONE (-1f).
 */
public class AppBrightnessModule extends ReactContextBaseJavaModule {
  public static final String NAME = "AppBrightness";

  private static final String E_ACTIVITY = "E_NO_ACTIVITY";
  private static final String E_READ = "E_READ";
  private static final String E_WRITE = "E_WRITE";

  private final ReactApplicationContext reactContext;

  public AppBrightnessModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void getBrightness(Promise promise) {
    try {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        float windowValue = activity.getWindow().getAttributes().screenBrightness;
        if (windowValue >= 0f) {
          promise.resolve((double) windowValue);
          return;
        }
      }
      promise.resolve(readSystemBrightnessNormalized());
    } catch (Exception e) {
      promise.reject(E_READ, "Unable to read brightness", e);
    }
  }

  @ReactMethod
  public void setBrightness(double value, Promise promise) {
    setWindowBrightness(clamp01(value), promise);
  }

  @ReactMethod
  public void getAppBrightness(Promise promise) {
    try {
      Activity activity = getCurrentActivity();
      if (activity == null) {
        promise.reject(E_ACTIVITY, "No current activity");
        return;
      }
      promise.resolve((double) activity.getWindow().getAttributes().screenBrightness);
    } catch (Exception e) {
      promise.reject(E_READ, "Unable to read app brightness", e);
    }
  }

  @ReactMethod
  public void setAppBrightness(double value, Promise promise) {
    double level = value < 0
        ? WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
        : clamp01(value);
    setWindowBrightness(level, promise);
  }

  @ReactMethod
  public void restoreSystemBrightness(Promise promise) {
    setWindowBrightness(WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE, promise);
  }

  private void setWindowBrightness(final double value, final Promise promise) {
    final Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(E_ACTIVITY, "No current activity");
      return;
    }
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          WindowManager.LayoutParams lp = activity.getWindow().getAttributes();
          lp.screenBrightness = (float) value;
          activity.getWindow().setAttributes(lp);
          promise.resolve(null);
        } catch (Exception e) {
          promise.reject(E_WRITE, "Unable to set app brightness", e);
        }
      }
    });
  }

  /** Read-only system brightness (0..1). Does not require WRITE_SETTINGS. */
  private double readSystemBrightnessNormalized() {
    try {
      int raw = Settings.System.getInt(
          reactContext.getContentResolver(),
          Settings.System.SCREEN_BRIGHTNESS
      );
      if (raw < 0) raw = 0;
      if (raw > 255) raw = 255;
      return raw / 255.0;
    } catch (Settings.SettingNotFoundException e) {
      return 0.5;
    }
  }

  private static double clamp01(double value) {
    if (Double.isNaN(value)) return 0;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }
}
