#import "AppBrightness.h"
#import <UIKit/UIKit.h>

@implementation AppBrightness

RCT_EXPORT_MODULE(AppBrightness)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

static inline CGFloat Clamp01(CGFloat value)
{
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

RCT_EXPORT_METHOD(getBrightness:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@([UIScreen mainScreen].brightness));
}

RCT_EXPORT_METHOD(setBrightness:(double)value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [UIScreen mainScreen].brightness = Clamp01((CGFloat)value);
  resolve(nil);
}

RCT_EXPORT_METHOD(getAppBrightness:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // iOS has no separate window brightness API — alias to screen brightness.
  resolve(@([UIScreen mainScreen].brightness));
}

RCT_EXPORT_METHOD(setAppBrightness:(double)value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [UIScreen mainScreen].brightness = Clamp01((CGFloat)value);
  resolve(nil);
}

RCT_EXPORT_METHOD(restoreSystemBrightness:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // iOS has no "follow system" window flag. JS helpers restore a previously saved value.
  // Native no-op so callers can share one API across platforms.
  resolve(nil);
}

@end
