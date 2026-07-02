import { getWesternSign } from './westernZodiac';

describe('getWesternSign', () => {
  it.each([
    ['2000-03-21', 'aries'],
    ['2000-04-19', 'aries'],
    ['2000-04-20', 'taurus'],
    ['2000-05-20', 'taurus'],
    ['2000-05-21', 'gemini'],
    ['2000-06-20', 'gemini'],
    ['2000-06-21', 'cancer'],
    ['2000-07-22', 'cancer'],
    ['2000-07-23', 'leo'],
    ['2000-08-22', 'leo'],
    ['2000-08-23', 'virgo'],
    ['2000-09-22', 'virgo'],
    ['2000-09-23', 'libra'],
    ['2000-10-22', 'libra'],
    ['2000-10-23', 'scorpio'],
    ['2000-11-21', 'scorpio'],
    ['2000-11-22', 'sagittarius'],
    ['2000-12-21', 'sagittarius'],
    ['2000-12-22', 'capricorn'],
    ['2000-01-19', 'capricorn'],
    ['2000-01-20', 'aquarius'],
    ['2000-02-18', 'aquarius'],
    ['2000-02-19', 'pisces'],
    ['2000-03-20', 'pisces'],
  ])('%s -> %s', (dateStr, expected) => {
    expect(getWesternSign(new Date(dateStr))).toMatchObject({ id: expected });
  });

  it('handles the Capricorn year wrap (Dec 31)', () => {
    expect(getWesternSign(new Date('2000-12-31')).id).toBe('capricorn');
  });

  it('handles the Capricorn year wrap (Jan 1)', () => {
    expect(getWesternSign(new Date('2000-01-01')).id).toBe('capricorn');
  });

  it('includes Hungarian metadata for every sign', () => {
    const sign = getWesternSign(new Date('2000-08-01'));
    expect(sign).toEqual({
      id: 'leo',
      nameHu: 'Oroszlán',
      element: 'fire',
      rulingPlanetHu: 'Nap',
      symbol: '♌',
    });
  });
});
