import { describe, expect, it } from 'vitest';
import { blinkDuration, blinkKeyframes } from '../src/finguide-mark';

describe('finguide mark blink', () => {
  it('closes, holds and opens over 340ms for a single blink', () => {
    const frames = blinkKeyframes(false);
    expect(blinkDuration(false)).toBe(340);
    expect(frames.map((f) => f.offset)).toEqual([0, 100 / 340, 240 / 340, 1]);
    expect(frames.map((f) => f.transform)).toEqual(['scaleY(1)', 'scaleY(0.1)', 'scaleY(0.1)', 'scaleY(1)']);
  });

  it('repeats the blink after a 120ms gap for a double blink', () => {
    const frames = blinkKeyframes(true);
    expect(blinkDuration(true)).toBe(800);
    expect(frames).toHaveLength(8);
    expect(frames[3].offset).toBeCloseTo(340 / 800);
    expect(frames[4].offset).toBeCloseTo(460 / 800);
    expect(frames[7].offset).toBe(1);
  });
});
