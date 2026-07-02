# Asztro App – Claude Code instrukciók

## Projekt
AI-alapú horoszkóp és "tenyérjós" mobilapp (iOS + Android), magyar nyelvű UI.
Fő funkciók: nyugati + kínai horoszkóp kombinált személyleírás, AI jós chat,
párkompatibilitás-elemzés. Szórakoztató célú app – a jóslás hangvétele játékos,
misztikus, de soha nem ad egészségügyi, pénzügyi vagy jogi tanácsot.

## Stack
- Expo SDK 57, Expo Router (file-based routing, `app/` könyvtár)
- TypeScript strict mode – `any` tilos
- Stílus: React Native StyleSheet + központi theme (`src/theme.ts`),
  NEM használunk NativeWind/Tailwind-et
- State: React hooks + Context, külső state lib csak indokolt esetben
- Perzisztencia: expo-sqlite vagy AsyncStorage (profilok lokálisan tárolva)
- AI: Anthropic API, de a kliens SOHA nem hívja közvetlenül – backend proxy
  lesz később; addig a hívásokat egy `src/services/ai.ts` interfész mögé rejtsd,
  mock implementációval

## Konvenciók
- Nyelv: UI szövegek magyarul, kód/kommentek/commit üzenetek angolul
- Minden UI szöveg a `src/i18n/hu.ts` fájlból jön (később jöhet EN)
- Üzleti logika (jegyszámítás, kompatibilitás) tiszta TS utilokban
  a `src/lib/` alatt, React-tól függetlenül, unit tesztekkel
- Tesztek: Jest (jest-expo preset), a `src/lib/` moduloknál kötelező
- Komponensek: `src/components/`, képernyők: `app/`
- Dark, misztikus vizuális irány: mélykék/lila alap, arany kiemelés,
  csillag-motívumok – minden szín a theme-ből

## Domain szabályok
- Nyugati zodiákus: fix dátumhatárok, a határnapokat (pl. márc. 20/21)
  a konvencionális határokkal kezeljük, nem asztronómiai pontossággal
- Kínai zodiákus: az év a HOLDÚJÉVKOR vált, nem január 1-jén!
  A `src/lib/chineseZodiac.ts` tartalmaz egy holdújév-dátumtáblát
  (1920–2035), és ez alapján dönt. Elem (fa/tűz/föld/fém/víz) és
  yin/yang is számítandó.
- Születési dátum személyes adat: csak lokálisan tároljuk, analytics-be
  soha nem kerül

## Munkamódszer
- Kis, fókuszált commitok, konvencionális commit üzenetek
- Új függőség telepítése előtt kérdezz rá
- `npx expo start` fut a háttérben – a változásokat Expo Go-ban ellenőrzöm