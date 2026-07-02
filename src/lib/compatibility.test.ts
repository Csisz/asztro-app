import { getCompatibility } from './compatibility';
import type { Profile } from './profile';

const rat: Profile = { name: 'Rat (Aries)', birthDate: '2020-04-01' };
const rat2: Profile = { name: 'Rat (Aries) #2', birthDate: '2008-04-01' };
const dragon: Profile = { name: 'Dragon (Leo)', birthDate: '2024-08-01' };
const ox: Profile = { name: 'Ox (Cancer)', birthDate: '2021-07-01' };
const horse: Profile = { name: 'Horse (Gemini)', birthDate: '1990-06-01' };
const tiger: Profile = { name: 'Tiger (Aries)', birthDate: '2022-04-01' };

describe('getCompatibility - Chinese zodiac relation', () => {
  it('trine group members score the highest (Rat + Dragon)', () => {
    const result = getCompatibility(rat, dragon);
    expect(result.chineseRelation).toBe('trine');
    expect(result.chineseScore).toBe(95);
  });

  it('secret friends score highly (Rat + Ox)', () => {
    const result = getCompatibility(rat, ox);
    expect(result.chineseRelation).toBe('secretFriend');
    expect(result.chineseScore).toBe(90);
  });

  it('clash pairs score the lowest (Rat + Horse)', () => {
    const result = getCompatibility(rat, horse);
    expect(result.chineseRelation).toBe('clash');
    expect(result.chineseScore).toBe(30);
  });

  it('the same animal scores well but below trine/secret friend (Rat + Rat)', () => {
    const result = getCompatibility(rat, rat2);
    expect(result.chineseRelation).toBe('same');
    expect(result.chineseScore).toBe(75);
  });

  it('unrelated animals fall back to a neutral score (Rat + Tiger)', () => {
    const result = getCompatibility(rat, tiger);
    expect(result.chineseRelation).toBe('neutral');
    expect(result.chineseScore).toBe(60);
  });

  it('is symmetric regardless of argument order', () => {
    expect(getCompatibility(rat, dragon).chineseRelation).toBe(
      getCompatibility(dragon, rat).chineseRelation
    );
    expect(getCompatibility(rat, horse).chineseRelation).toBe(
      getCompatibility(horse, rat).chineseRelation
    );
  });
});

describe('getCompatibility - western element score', () => {
  it('same element scores highest (Aries fire + Leo fire)', () => {
    const result = getCompatibility(rat, dragon);
    expect(result.westernElementA).toBe('fire');
    expect(result.westernElementB).toBe('fire');
    expect(result.westernScore).toBe(85);
  });

  it('opposing elements score lowest (Aries fire + Cancer water)', () => {
    const result = getCompatibility(rat, ox);
    expect(result.westernElementA).toBe('fire');
    expect(result.westernElementB).toBe('water');
    expect(result.westernScore).toBe(35);
  });
});

describe('getCompatibility - overall weighted score', () => {
  it('combines the Chinese (60%) and western (40%) scores deterministically', () => {
    // trine (95) * 0.6 + fire-fire (85) * 0.4 = 57 + 34 = 91
    expect(getCompatibility(rat, dragon).overallScore).toBe(91);
    // clash (30) * 0.6 + fire-air (80) * 0.4 = 18 + 32 = 50
    expect(getCompatibility(rat, horse).overallScore).toBe(50);
  });

  it('always returns a score between 0 and 100', () => {
    [dragon, ox, horse, tiger, rat2].forEach((other) => {
      const { overallScore } = getCompatibility(rat, other);
      expect(overallScore).toBeGreaterThanOrEqual(0);
      expect(overallScore).toBeLessThanOrEqual(100);
    });
  });
});
