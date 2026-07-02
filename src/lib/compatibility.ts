import type { ChineseAnimal } from './chineseZodiac';
import { getChineseSign } from './chineseZodiac';
import type { Profile } from './profile';
import type { WesternElement } from './westernZodiac';
import { getWesternSign } from './westernZodiac';

export type ChineseRelation = 'same' | 'trine' | 'secretFriend' | 'clash' | 'neutral';

/** The 4 harmony ("San He") trine groups of the 12 animals. */
const TRINE_GROUPS: ChineseAnimal[][] = [
  ['rat', 'dragon', 'monkey'],
  ['ox', 'snake', 'rooster'],
  ['tiger', 'horse', 'dog'],
  ['rabbit', 'goat', 'pig'],
];

/** Six harmony ("Liu He") secret friend pairs. */
const SECRET_FRIENDS: Record<ChineseAnimal, ChineseAnimal> = {
  rat: 'ox',
  ox: 'rat',
  tiger: 'pig',
  pig: 'tiger',
  rabbit: 'dog',
  dog: 'rabbit',
  dragon: 'rooster',
  rooster: 'dragon',
  snake: 'monkey',
  monkey: 'snake',
  horse: 'goat',
  goat: 'horse',
};

/** Six clash ("Liu Chong") pairs - animals directly opposite on the 12-year wheel. */
const CLASHES: Record<ChineseAnimal, ChineseAnimal> = {
  rat: 'horse',
  horse: 'rat',
  ox: 'goat',
  goat: 'ox',
  tiger: 'monkey',
  monkey: 'tiger',
  rabbit: 'rooster',
  rooster: 'rabbit',
  dragon: 'dog',
  dog: 'dragon',
  snake: 'pig',
  pig: 'snake',
};

const CHINESE_RELATION_SCORES: Record<ChineseRelation, number> = {
  trine: 95,
  secretFriend: 90,
  same: 75,
  neutral: 60,
  clash: 30,
};

function getChineseRelation(a: ChineseAnimal, b: ChineseAnimal): ChineseRelation {
  if (a === b) return 'same';
  if (CLASHES[a] === b) return 'clash';
  if (SECRET_FRIENDS[a] === b) return 'secretFriend';
  const trine = TRINE_GROUPS.find((group) => group.includes(a));
  if (trine?.includes(b)) return 'trine';
  return 'neutral';
}

/** General traditional element affinity: feeding/same elements score high, opposing ones low. */
const ELEMENT_COMPATIBILITY: Record<WesternElement, Record<WesternElement, number>> = {
  fire: { fire: 85, earth: 45, air: 80, water: 35 },
  earth: { fire: 45, earth: 80, air: 45, water: 85 },
  air: { fire: 80, earth: 45, air: 80, water: 45 },
  water: { fire: 35, earth: 85, air: 45, water: 85 },
};

export interface CompatibilityResult {
  overallScore: number;
  chineseScore: number;
  chineseRelation: ChineseRelation;
  westernScore: number;
  westernElementA: WesternElement;
  westernElementB: WesternElement;
}

const CHINESE_WEIGHT = 0.6;
const WESTERN_WEIGHT = 0.4;

export function getCompatibility(a: Profile, b: Profile): CompatibilityResult {
  const chineseA = getChineseSign(new Date(a.birthDate));
  const chineseB = getChineseSign(new Date(b.birthDate));
  const westernA = getWesternSign(new Date(a.birthDate));
  const westernB = getWesternSign(new Date(b.birthDate));

  const chineseRelation = getChineseRelation(chineseA.animal, chineseB.animal);
  const chineseScore = CHINESE_RELATION_SCORES[chineseRelation];
  const westernScore = ELEMENT_COMPATIBILITY[westernA.element][westernB.element];
  const overallScore = Math.round(chineseScore * CHINESE_WEIGHT + westernScore * WESTERN_WEIGHT);

  return {
    overallScore,
    chineseScore,
    chineseRelation,
    westernScore,
    westernElementA: westernA.element,
    westernElementB: westernB.element,
  };
}
