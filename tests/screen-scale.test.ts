import { describe, expect, it } from 'vitest';
import { screenScale } from '../src/screen-scale';

describe('screenScale', () => {
  it('leaves sheets at full size when the window is as wide as an A4 sheet or wider', () => {
    expect(screenScale(794)).toBe(1);
    expect(screenScale(1440)).toBe(1);
  });

  it('shrinks the sheet to the window between the phone layout and A4 width', () => {
    expect(screenScale(765)).toBeCloseTo(765 / ((210 / 25.4) * 96), 4);
    expect(screenScale(641)).toBeLessThan(0.82);
    expect(screenScale(641)).toBeGreaterThan(0.8);
  });

  it('does not scale the phone layout, which reflows instead', () => {
    expect(screenScale(640)).toBe(1);
    expect(screenScale(375)).toBe(1);
  });
});
