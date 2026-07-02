import { getChineseSign, getElement, getLunarYearLabel, getYinYang } from './chineseZodiac';

describe('getChineseSign', () => {
  it('1990-02-10 is still Horse (well after the 1990 lunar new year on Jan 27)', () => {
    expect(getChineseSign(new Date('1990-02-10')).animal).toBe('horse');
  });

  it('the day before the 1990 lunar new year (Jan 26) is still Snake (1989)', () => {
    const sign = getChineseSign(new Date('1990-01-26'));
    expect(sign.animal).toBe('snake');
    expect(sign.lunarYear).toBe(1989);
  });

  it('the 1990 lunar new year itself (Jan 27) is already Horse', () => {
    const sign = getChineseSign(new Date('1990-01-27'));
    expect(sign.animal).toBe('horse');
    expect(sign.lunarYear).toBe(1990);
  });

  it('1990 Horse is White Metal, Yang (cross-checked against source table)', () => {
    const sign = getChineseSign(new Date('1990-06-01'));
    expect(sign.element).toBe('metal');
    expect(sign.yinYang).toBe('yang');
  });

  it('day before the 2024 lunar new year (Feb 9) is Rabbit (2023)', () => {
    expect(getChineseSign(new Date('2024-02-09')).animal).toBe('rabbit');
  });

  it('the 2024 lunar new year itself (Feb 10) is Dragon', () => {
    expect(getChineseSign(new Date('2024-02-10')).animal).toBe('dragon');
  });

  it('day before the 2033 lunar new year (Jan 30) is Rat (2032)', () => {
    expect(getChineseSign(new Date('2033-01-30')).animal).toBe('rat');
  });

  it('the 2033 lunar new year itself (Jan 31) is Ox', () => {
    expect(getChineseSign(new Date('2033-01-31')).animal).toBe('ox');
  });

  it('1920 is the Metal Monkey year (well-known reference point: Geng Shen)', () => {
    const sign = getChineseSign(new Date('1920-06-01'));
    expect(sign.animal).toBe('monkey');
    expect(sign.element).toBe('metal');
    expect(sign.yinYang).toBe('yang');
  });

  it('2020-01-25 (lunar new year) is Rat, but 2020-01-24 is still Pig (2019)', () => {
    expect(getChineseSign(new Date('2020-01-25')).animal).toBe('rat');
    expect(getChineseSign(new Date('2020-01-24')).animal).toBe('pig');
  });

  it('includes Hungarian metadata', () => {
    const sign = getChineseSign(new Date('2024-03-01'));
    expect(sign).toMatchObject({
      animal: 'dragon',
      animalNameHu: 'Sárkány',
      element: 'wood',
      elementNameHu: 'Fa',
      yinYang: 'yang',
      yinYangNameHu: 'Jang',
      lunarYear: 2024,
    });
  });

  it('throws for dates outside the supported lunar table range', () => {
    expect(() => getChineseSign(new Date('1919-06-01'))).toThrow();
    expect(() => getChineseSign(new Date('2036-06-01'))).toThrow();
  });
});

describe('getLunarYearLabel', () => {
  it('the 12-year animal cycle repeats consistently for Rat years', () => {
    // Well-documented Rat years spanning the whole supported range.
    [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020].forEach((year) => {
      expect(getLunarYearLabel(new Date(`${year}-06-01`))).toBe(year);
    });
  });
});

describe('getElement / getYinYang', () => {
  it('elements cycle in pairs of 2 lunar years', () => {
    expect(getElement(2024)).toBe('wood');
    expect(getElement(2025)).toBe('wood');
    expect(getElement(2026)).toBe('fire');
    expect(getElement(2027)).toBe('fire');
    expect(getElement(2028)).toBe('earth');
    expect(getElement(2029)).toBe('earth');
    expect(getElement(2030)).toBe('metal');
    expect(getElement(2031)).toBe('metal');
    expect(getElement(2032)).toBe('water');
    expect(getElement(2033)).toBe('water');
  });

  it('yin/yang follows even/odd lunar year', () => {
    expect(getYinYang(2024)).toBe('yang');
    expect(getYinYang(2025)).toBe('yin');
  });
});
