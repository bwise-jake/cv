/**
 * Idle life for the finguide logo, ported from finguide-marketing's `AnimatedPigMark`
 * (web/components/brand/animatedPigMark.tsx): the same timers, spring, hop and cursor-follow numbers,
 * without React or `motion`. The mark glances, blinks, flicks an ear and now and then hops; on a fine
 * pointer its eyes follow the cursor and a click makes it hop.
 *
 * It moves only while the page is visible, the mark is on screen, motion is allowed and the page is not
 * printing; otherwise it sits in its resting pose (the markup's own, with no inline styles).
 */

/** The original's design frame is 96px; its SVG is 120 units wide, so one frame px is 1.25 SVG units. */
const UNIT = 120 / 96;
const LOOK_REACH = 160;
const LEAN_REACH = 120;
const POINTER_GLANCE_PAUSE_MS = 3000;

/** Eye movement: a snappy spring with a little overshoot, so a glance lands and settles. */
const SPRING = { stiffness: 380, damping: 17 };

const EASE_IN = 'cubic-bezier(0.42, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0, 0, 0.58, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.42, 0, 0.58, 1)';

export interface IdleProfile {
  glanceX: number;
  glanceY: number;
  eyeScaleX: number;
  eyeScaleY: number;
  glanceMinMs: number;
  glanceMaxMs: number;
  glanceFirstMs: number;
  hopMinMs: number;
  hopMaxMs: number;
  hopFirstMs: number;
  hopLift: number;
  earAngle: number;
  earMinMs: number;
  earMaxMs: number;
  earFirstMinMs: number;
  earFirstMaxMs: number;
  breathePeak: number;
  breatheSeconds: number;
}

const FINE_IDLE: IdleProfile = {
  glanceX: 5,
  glanceY: 4,
  eyeScaleX: 0.12,
  eyeScaleY: 0.08,
  glanceMinMs: 1200,
  glanceMaxMs: 2800,
  glanceFirstMs: 800,
  hopMinMs: 20000,
  hopMaxMs: 30000,
  hopFirstMs: 2500,
  hopLift: 14,
  earAngle: 14,
  earMinMs: 8000,
  earMaxMs: 15000,
  earFirstMinMs: 4000,
  earFirstMaxMs: 8000,
  breathePeak: 1.015,
  breatheSeconds: 4,
};

/** Touch devices: the same behaviours, a little louder, so the mark reads at a small size. */
const COARSE_IDLE: IdleProfile = {
  glanceX: 8,
  glanceY: 6,
  eyeScaleX: 0.2,
  eyeScaleY: 0.14,
  glanceMinMs: 1000,
  glanceMaxMs: 2200,
  glanceFirstMs: 600,
  hopMinMs: 12000,
  hopMaxMs: 20000,
  hopFirstMs: 1200,
  hopLift: 20,
  earAngle: 22,
  earMinMs: 5000,
  earMaxMs: 10000,
  earFirstMinMs: 2000,
  earFirstMaxMs: 4500,
  breathePeak: 1.035,
  breatheSeconds: 3.2,
};

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

/** One blink (close 100ms, hold 140ms, open 100ms), or two with a 120ms gap. */
export function blinkKeyframes(double: boolean): Keyframe[] {
  const beats = [0, 100, 240, 340];
  if (double) beats.push(460, 560, 700, 800);
  const total = beats[beats.length - 1];
  const shut = [1, 0.1, 0.1, 1];
  const values = double ? [...shut, ...shut] : shut;
  return beats.map((beat, i) => ({ offset: beat / total, transform: `scaleY(${values[i]})`, easing: EASE_IN_OUT }));
}

export function blinkDuration(double: boolean): number {
  return double ? 800 : 340;
}

/** Hop: crouch, launch (stretched), fall, land (squashed), one small rebound, settle. */
function hopKeyframes(offsets: number[], transforms: string[]): Keyframe[] {
  const eases = [EASE_IN_OUT, EASE_OUT, EASE_IN, EASE_OUT, EASE_IN];
  return offsets.map((offset, i) => ({ offset, transform: transforms[i], ...(i < eases.length ? { easing: eases[i] } : {}) }));
}

const HOP_OFFSETS = [0, 0.2, 0.42, 0.62, 0.8, 1];
const HOP_MS = 950;

interface Gaze {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
}

/** Advance one damped-spring axis by `dt` seconds (semi-implicit Euler, fine sub-steps). */
function stepSpring(pos: number, vel: number, target: number, dt: number): [number, number] {
  const { stiffness, damping } = SPRING;
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    vel += (-stiffness * (pos - target) - damping * vel) * h;
    pos += vel * h;
  }
  return [pos, vel];
}

interface Mark {
  host: HTMLElement;
  destroy(): void;
}

function createMark(host: HTMLElement): Mark | null {
  const q = <T extends Element>(sel: string) => host.querySelector<T>(sel);
  const lean = q<SVGGElement>('.fg-lean');
  const hop = q<SVGGElement>('.fg-hop');
  const eyes = q<SVGGElement>('.fg-eyes');
  const eyeHop = q<SVGGElement>('.fg-eyehop');
  const blink = q<SVGGElement>('.fg-blink');
  const eyeL = q<SVGCircleElement>('.fg-eye-l');
  const eyeR = q<SVGCircleElement>('.fg-eye-r');
  const earL = q<SVGPathElement>('.fg-ear-l');
  const earR = q<SVGPathElement>('.fg-ear-r');
  if (!lean || !hop || !eyes || !eyeHop || !blink || !eyeL || !eyeR || !earL || !earR) return null;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const printing = matchMedia('print');
  const finePointer = matchMedia('(pointer: fine)').matches;
  const idle = finePointer ? FINE_IDLE : COARSE_IDLE;

  let onScreen = true;
  let tabVisible = !document.hidden;
  let running = false;

  let timers = new Set<number>();
  let animations = new Set<Animation>();
  let cancelled = false;
  let hopping = false;
  let lastPointerAt = 0;
  let raf = 0;
  let lastFrame = 0;
  const gaze: Gaze = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  let removePointer: (() => void) | null = null;

  const applyGaze = () => {
    eyes.style.transform = `translate(${gaze.x * UNIT}px, ${gaze.y * UNIT}px)`;
    // The eye on the side it turns toward swells and the other shrinks a touch: a turn in depth.
    const look = gaze.x / idle.glanceX;
    eyeL.style.transform = `scale(${1 - look * idle.eyeScaleX}, ${1 - look * idle.eyeScaleY})`;
    eyeR.style.transform = `scale(${1 + look * idle.eyeScaleX}, ${1 + look * idle.eyeScaleY})`;
  };

  const frame = (now: number) => {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    [gaze.x, gaze.vx] = stepSpring(gaze.x, gaze.vx, gaze.tx, dt);
    [gaze.y, gaze.vy] = stepSpring(gaze.y, gaze.vy, gaze.ty, dt);
    const resting =
      Math.abs(gaze.vx) < 0.05 && Math.abs(gaze.vy) < 0.05 && Math.abs(gaze.x - gaze.tx) < 0.01 && Math.abs(gaze.y - gaze.ty) < 0.01;
    if (resting) {
      gaze.x = gaze.tx;
      gaze.y = gaze.ty;
      gaze.vx = 0;
      gaze.vy = 0;
      raf = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }
    applyGaze();
  };

  const kick = () => {
    if (raf) return;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  };

  /** Snap the gaze (cursor tracking), cancelling any spring in flight. */
  const setGaze = (x: number, y: number) => {
    Object.assign(gaze, { x, y, vx: 0, vy: 0, tx: x, ty: y });
    applyGaze();
  };

  /** Run a one-shot animation; resolves when it ends or is cancelled. */
  const play = async (el: Element, keyframes: Keyframe[], duration: number): Promise<void> => {
    const animation = el.animate(keyframes, { duration });
    animations.add(animation);
    try {
      await animation.finished;
    } catch {
      // cancelled by stop()
    }
    animations.delete(animation);
  };

  /** Re-arms itself after `task`; `timers` lets a stop clear whatever is pending. */
  const loop = (task: () => Promise<void> | void, nextDelay: () => number, firstDelay: number) => {
    const schedule = (delay: number) => {
      const timer = window.setTimeout(async () => {
        timers.delete(timer);
        if (cancelled) return;
        await task();
        if (!cancelled) schedule(nextDelay());
      }, delay);
      timers.add(timer);
    };
    schedule(firstDelay);
  };

  // Squash and stretch pivot on the feet, so the body stays planted while it deforms; the eyes squint in the
  // crouch and open wide at the top.
  const playHop = async () => {
    if (hopping) return;
    hopping = true;
    const lift = idle.hopLift * UNIT;
    const ys = [0, 0, -lift, 0, -lift * 0.18, 0];
    const sx = [1, 1.07, 0.95, 1.08, 0.99, 1];
    const sy = [1, 0.9, 1.07, 0.9, 1.02, 1];
    const ex = [1, 1.1, 0.95, 1.1, 1, 1];
    const ey = [1, 0.75, 1.2, 0.8, 1, 1];
    await Promise.all([
      play(hop, hopKeyframes(HOP_OFFSETS, ys.map((y, i) => `translateY(${y}px) scale(${sx[i]}, ${sy[i]})`)), HOP_MS),
      play(eyeHop, hopKeyframes(HOP_OFFSETS, ex.map((x, i) => `scale(${x}, ${ey[i]})`)), HOP_MS),
    ]);
    hopping = false;
  };

  const flick = (ear: SVGPathElement, angle: number) =>
    play(
      ear,
      [0, angle, -angle * 0.35, 0].map((deg) => ({ transform: `rotate(${deg}deg)`, easing: EASE_OUT })),
      320,
    );

  const bindPointer = () => {
    if (!finePointer) return null;
    let rafId = 0;
    let latest: PointerEvent | null = null;

    const apply = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      lastPointerAt = Date.now();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      const reach = Math.min(d / LOOK_REACH, 1);
      setGaze(ux * reach * FINE_IDLE.glanceX, uy * reach * FINE_IDLE.glanceY);
      lean.style.transform = `rotate(${ux * Math.max(0, 1 - d / LEAN_REACH) * 7}deg)`;
    };

    const onMove = (event: PointerEvent) => {
      latest = event;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (latest) apply(latest);
        latest = null;
      });
    };

    const onDown = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const onMark = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (onMark) void playHop();
    };

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      if (rafId) cancelAnimationFrame(rafId);
    };
  };

  const start = () => {
    running = true;
    cancelled = false;
    host.dataset.active = 'true';
    host.style.setProperty('--fg-breathe-peak', String(idle.breathePeak));
    host.style.setProperty('--fg-breathe-seconds', `${idle.breatheSeconds}s`);

    // Eyes glance somewhere new every 1.2-2.8s (one in four is back to centre).
    loop(
      () => {
        if (Date.now() - lastPointerAt < POINTER_GLANCE_PAUSE_MS) return;
        const centre = Math.random() < 0.25;
        gaze.tx = centre ? 0 : randomBetween(-1, 1) * idle.glanceX;
        gaze.ty = centre ? 0 : randomBetween(-0.7, 0.7) * idle.glanceY;
        kick();
      },
      () => randomBetween(idle.glanceMinMs, idle.glanceMaxMs),
      idle.glanceFirstMs,
    );

    // Blink every 2-5s; one in four is a double blink.
    loop(
      () => {
        const double = Math.random() < 0.25;
        return play(blink, blinkKeyframes(double), blinkDuration(double));
      },
      () => randomBetween(2000, 5000),
      randomBetween(2000, 5000),
    );

    // An occasional hop, every 20-30s (the first soon after the mark starts moving).
    loop(playHop, () => randomBetween(idle.hopMinMs, idle.hopMaxMs), idle.hopFirstMs);

    // Every 8-15s one ear flicks outward (one time in five, both).
    loop(
      async () => {
        const both = Math.random() < 0.2;
        const left = both || Math.random() < 0.5;
        await Promise.all([left && flick(earL, -idle.earAngle), (both || !left) && flick(earR, idle.earAngle)]);
      },
      () => randomBetween(idle.earMinMs, idle.earMaxMs),
      randomBetween(idle.earFirstMinMs, idle.earFirstMaxMs),
    );

    removePointer = bindPointer();
  };

  const stop = () => {
    running = false;
    cancelled = true;
    timers.forEach((timer) => clearTimeout(timer));
    timers = new Set();
    animations.forEach((animation) => animation.cancel());
    animations = new Set();
    removePointer?.();
    removePointer = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    hopping = false;
    Object.assign(gaze, { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
    for (const el of [lean, eyes, eyeL, eyeR]) el.style.transform = '';
    host.dataset.active = 'false';
  };

  const sync = () => {
    const want = !reducedMotion.matches && !printing.matches && onScreen && tabVisible;
    if (want && !running) start();
    else if (!want && running) stop();
  };

  const observer = typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver((entries) => {
        const latest = entries[entries.length - 1];
        if (latest) {
          onScreen = latest.isIntersecting;
          sync();
        }
      });
  observer?.observe(host);
  const onVisibility = () => {
    tabVisible = !document.hidden;
    sync();
  };
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', sync);
  printing.addEventListener('change', sync);
  sync();

  return {
    host,
    destroy() {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', sync);
      printing.removeEventListener('change', sync);
    },
  };
}

let current: Mark | null = null;

/** (Re)bind the animated finguide mark in `root`. Safe to call after every render: it replaces a stale binding. */
export function mountFinguideMark(root: ParentNode): void {
  const host = root.querySelector<HTMLElement>('.employer-logo-mark');
  if (host && current?.host === host) return;
  current?.destroy();
  current = host ? createMark(host) : null;
}
