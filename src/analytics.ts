/**
 * Privacy-friendly analytics via Umami (no cookies, no consent banner). Off unless
 * VITE_UMAMI_WEBSITE_ID is set at build time, and never loaded on localhost.
 * Events: Visit, Theme, Focus, PDF download, Metric note — each tagged with `for` when present.
 */
type Props = Record<string, string | number | null | undefined>;
type Umami = { track: (event: string, data?: Props) => void };

const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined;
const SCRIPT_URL = (import.meta.env.VITE_UMAMI_SCRIPT_URL as string | undefined) ?? 'https://cloud.umami.is/script.js';

const queue: [string, Props][] = [];
let context: Props = {};
let enabled = false;

const umami = () => (window as unknown as { umami?: Umami }).umami;

export function initAnalytics(baseProps: Props) {
  context = Object.fromEntries(Object.entries(baseProps).filter(([, v]) => v != null && v !== ''));
  enabled = Boolean(WEBSITE_ID) && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
  if (!enabled) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = SCRIPT_URL;
  script.dataset.websiteId = WEBSITE_ID;
  script.onload = () => queue.splice(0).forEach(([e, p]) => umami()?.track(e, p));
  document.head.append(script);
}

export function track(event: string, props: Props = {}) {
  const data = { ...context, ...props };
  if (import.meta.env.DEV) console.debug('[analytics]', event, data);
  if (!enabled) return;
  const u = umami();
  if (u) u.track(event, data);
  else queue.push([event, data]);
}
