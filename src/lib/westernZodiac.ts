export type WesternSignId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type WesternElement = 'fire' | 'earth' | 'air' | 'water';

export interface WesternSign {
  id: WesternSignId;
  nameHu: string;
  element: WesternElement;
  rulingPlanetHu: string;
  symbol: string;
}

/**
 * Conventional (not astronomical) fixed date boundaries, as used by popular
 * astrology. `start`/`end` are inclusive month-day pairs; signs that wrap
 * across the new year (Capricorn) are handled separately in getWesternSign.
 */
interface WesternSignBoundary {
  sign: WesternSign;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const SIGNS: Record<WesternSignId, WesternSign> = {
  aries: { id: 'aries', nameHu: 'Kos', element: 'fire', rulingPlanetHu: 'Mars', symbol: '♈' },
  taurus: { id: 'taurus', nameHu: 'Bika', element: 'earth', rulingPlanetHu: 'Vénusz', symbol: '♉' },
  gemini: { id: 'gemini', nameHu: 'Ikrek', element: 'air', rulingPlanetHu: 'Merkúr', symbol: '♊' },
  cancer: { id: 'cancer', nameHu: 'Rák', element: 'water', rulingPlanetHu: 'Hold', symbol: '♋' },
  leo: { id: 'leo', nameHu: 'Oroszlán', element: 'fire', rulingPlanetHu: 'Nap', symbol: '♌' },
  virgo: { id: 'virgo', nameHu: 'Szűz', element: 'earth', rulingPlanetHu: 'Merkúr', symbol: '♍' },
  libra: { id: 'libra', nameHu: 'Mérleg', element: 'air', rulingPlanetHu: 'Vénusz', symbol: '♎' },
  scorpio: { id: 'scorpio', nameHu: 'Skorpió', element: 'water', rulingPlanetHu: 'Plútó', symbol: '♏' },
  sagittarius: {
    id: 'sagittarius',
    nameHu: 'Nyilas',
    element: 'fire',
    rulingPlanetHu: 'Jupiter',
    symbol: '♐',
  },
  capricorn: {
    id: 'capricorn',
    nameHu: 'Bak',
    element: 'earth',
    rulingPlanetHu: 'Szaturnusz',
    symbol: '♑',
  },
  aquarius: {
    id: 'aquarius',
    nameHu: 'Vízöntő',
    element: 'air',
    rulingPlanetHu: 'Uránusz',
    symbol: '♒',
  },
  pisces: { id: 'pisces', nameHu: 'Halak', element: 'water', rulingPlanetHu: 'Neptunusz', symbol: '♓' },
};

const BOUNDARIES: WesternSignBoundary[] = [
  { sign: SIGNS.aries, startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: SIGNS.taurus, startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: SIGNS.gemini, startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { sign: SIGNS.cancer, startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { sign: SIGNS.leo, startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: SIGNS.virgo, startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: SIGNS.libra, startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { sign: SIGNS.scorpio, startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { sign: SIGNS.sagittarius, startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { sign: SIGNS.capricorn, startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: SIGNS.aquarius, startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: SIGNS.pisces, startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

export function getWesternSign(date: Date): WesternSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const boundary = BOUNDARIES.find(({ startMonth, startDay, endMonth, endDay }) => {
    if (startMonth <= endMonth) {
      const afterStart = month > startMonth || (month === startMonth && day >= startDay);
      const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
      return afterStart && beforeEnd;
    }
    // Wraps across the new year (Capricorn: Dec 22 - Jan 19)
    const inStartMonthRange = month === startMonth && day >= startDay;
    const inEndMonthRange = month === endMonth && day <= endDay;
    const inBetween = month > startMonth || month < endMonth;
    return inStartMonthRange || inEndMonthRange || inBetween;
  });

  if (!boundary) {
    throw new Error(`No western zodiac sign found for date ${date.toISOString()}`);
  }

  return boundary.sign;
}
