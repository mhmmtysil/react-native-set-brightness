# react-native-set-brightness

[![npm version](https://img.shields.io/npm/v/react-native-set-brightness.svg)](https://www.npmjs.com/package/react-native-set-brightness)

React Native **uygulama (window) parlaklığı** modülü. Geçici olarak parlaklığı max’a çekip blur / arka plana geçince güvenli restore için.

| Platform | Yazma | Okuma | Restore |
|----------|-------|-------|---------|
| **Android** | `WindowManager.LayoutParams.screenBrightness` (activity window) | Window override varsa o; yoksa sistem değeri **read-only** | `screenBrightness = -1` (sisteme bırak) |
| **iOS** | `UIScreen.main.brightness` | aynı | Native “follow system” yok → JS helper kaydedilen değere döner |

**Önemli:** Android’de `Settings.System` / `WRITE_SETTINGS` **yok**. Sistem ayarına yazmak OEM’lerde arka plan / ön plan kararma ve “eski değere dönememe” sorunlarını artırır.

- Mimari: klasik `NativeModule` + RN New Architecture **interop** (RN 0.73–0.83+)
- Autolinking
- Peer: `react-native >= 0.73`

---

## Kurulum

```bash
yarn add react-native-set-brightness
# veya
npm install react-native-set-brightness --save

# iOS
cd ios && pod install && cd ..
```

Native modül → **full rebuild** gerekir (Expo Go yetmez; bare / prebuild / dev client).

Local geliştirme (opsiyonel):

```bash
yarn add file:../react-native-set-brightness
```

---

## API

```ts
import AppBrightness, {
  getBrightness,
  setBrightness,
  getAppBrightness,
  setAppBrightness,
  restoreSystemBrightness,
  createBoostBrightnessController,
  useMaxBrightnessWhileFocused,
  isValidBrightness,
  clampBrightness,
} from 'react-native-set-brightness';
```

### Düşük seviye

| Metod | Açıklama |
|-------|----------|
| `getBrightness()` | `Promise<number>` — 0–1 |
| `setBrightness(value)` | 0–1 (Android = window) |
| `getAppBrightness()` / `setAppBrightness(value)` | Android window; iOS alias |
| `restoreSystemBrightness()` | Android `-1`; iOS native no-op (helper restore kullan) |

### Yüksek seviye (ekran odaklı)

- `useMaxBrightnessWhileFocused({ enabled?, maxLevel?, resumeDelayMs?, iosFallbackLevel? })`
- `createBoostBrightnessController(options)` → `{ start, stop, boost, dim, getState }`

`resumeDelayMs` varsayılanı **300**. Anlık re-boost için `0` ver (cihazda doğrulandı).

Davranış:

1. Mount / `start` → (iOS) geçerli parlaklığı kaydet (`> 0.05`) → max  
2. `background` / `inactive` → restore (Android `-1`, iOS saved veya `0.5`)  
3. `active` → `resumeDelayMs` sonra tekrar max  
4. Unmount / `stop` → final restore, saved temizlenir  

---

## Örnekler

### Hook (ekran odaklı)

```tsx
import React from 'react';
import {View} from 'react-native';
import {useMaxBrightnessWhileFocused} from 'react-native-set-brightness';

export function BrightScreen() {
  useMaxBrightnessWhileFocused({resumeDelayMs: 0});

  return <View>{/* content */}</View>;
}
```

### Imperatif (remount’ta state korumak için modül seviyesinde)

```ts
import {createBoostBrightnessController} from 'react-native-set-brightness';

const brightness = createBoostBrightnessController({resumeDelayMs: 0});

// ekran mount
brightness.start();
// ekran unmount / geri
brightness.stop();
```

---

## Neden sistem Settings değil?

- iOS’ta ayrı bir “sistem ayarı API’si” yok; `UIScreen.brightness` zaten uygulama etkiler.
- Android sistem yazımı `WRITE_SETTINGS` ister; izin yoksa sessiz fail / garip OEM davranışı.
- Adaptive Brightness + başka uygulamalar yarışır → tam kararma / restore kaybı tipik buradan gelir.
- Window (`-1` restore) izin istemez, aktivite yaşam döngüsüyle uyumludur.

---

## Test kontrol listesi

- [ ] Ekran açılınca parlaklık belirgin artıyor
- [ ] Home (background) → eski / sistem parlaklığı; simsiyah kalmıyor
- [ ] Uygulamaya geri dön → tekrar max (`resumeDelayMs`’e göre)
- [ ] Ekrandan pop → restore
- [ ] Android: WRITE_SETTINGS izni **istenmemeli**
- [ ] Samsung / Xiaomi / Pixel bg↔fg
- [ ] Hızlı kapat–aç stabil

---

## Sınırlamalar

- iOS auto-brightness OS tarafından yeniden uygulanabilir; restore sonrası kısa sapma normal olabilir.
- Android `getAppBrightness()` override yokken `-1` dönebilir; `getBrightness()` sistem okumasını (izin gerektirmeden) normalize eder.
- Foldable / multi-window’da window brightness o activity’ye özgüdür.
- Expo Go / uzak runtime: native modül yok.

---

## Repo

- GitHub: https://github.com/mhmmtysil/react-native-set-brightness  
- npm: https://www.npmjs.com/package/react-native-set-brightness  
- Lisans: MIT  

```
react-native-set-brightness/
  src/      TS API + boost helper
  ios/      AppBrightness (.h / .mm)
  android/  Java module + Package
  *.podspec
  react-native.config.js
```
