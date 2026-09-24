import { FOCUSES, THEME_IDS, type CvState, type Focus, type ThemeId } from './types';

const STORAGE_KEY = 'jaketb-cv:state';
export const DEFAULT_STATE: CvState = { theme: 'default', focus: 'balanced' };

const isTheme = (v: unknown): v is ThemeId => THEME_IDS.includes(v as ThemeId);
const isFocus = (v: unknown): v is Focus => FOCUSES.includes(v as Focus);

/** Precedence: URL query > saved preference > default. Invalid values fall through. */
export function resolveState(search: string, saved: Partial<CvState> | null): CvState {
  const params = new URLSearchParams(search);
  const pick = <T>(key: keyof CvState, guard: (v: unknown) => v is T, fallback: T): T => {
    const fromUrl = params.get(key)?.toLowerCase();
    if (guard(fromUrl)) return fromUrl;
    const fromSaved = saved?.[key];
    return guard(fromSaved) ? fromSaved : fallback;
  };
  return {
    theme: pick('theme', isTheme, DEFAULT_STATE.theme),
    focus: pick('focus', isFocus, DEFAULT_STATE.focus),
  };
}

/** Query string for a state, omitting defaults so the plain URL stays clean. */
export function toSearch(state: CvState, current = ''): string {
  const params = new URLSearchParams(current);
  (Object.keys(DEFAULT_STATE) as (keyof CvState)[]).forEach((key) => {
    if (state[key] === DEFAULT_STATE[key]) params.delete(key);
    else params.set(key, state[key]);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function readSaved(): Partial<CvState> | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

type Listener = (state: CvState, prev: CvState) => void;

let state: CvState = DEFAULT_STATE;
const listeners = new Set<Listener>();

export function initState(): CvState {
  state = resolveState(location.search, readSaved());
  return state;
}

export const getState = () => state;

export function setState(patch: Partial<CvState>) {
  const prev = state;
  state = { ...state, ...patch };
  if (prev.theme === state.theme && prev.focus === state.focus) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: the URL still carries state */
  }
  history.replaceState(null, '', `${location.pathname}${toSearch(state, location.search)}${location.hash}`);
  listeners.forEach((fn) => fn(state, prev));
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
