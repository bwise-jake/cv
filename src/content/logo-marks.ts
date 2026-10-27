// Animated employer marks, drawn inline so `src/finguide-mark.ts` and base.css can move their parts.

/**
 * The finguide.money mark, redrawn from finguide-marketing's `AnimatedPigMark` (dark-mode tone: near-black
 * face on a bright lime squircle). Each moving part gets its own group so the motions compose:
 * lean (cursor) > hop (squash and stretch) > face + ears, and gaze > eye hop > blink > eyes.
 */
export const finguideMark =
  '<svg class="fg-mark" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">' +
  '<g class="fg-lean"><g class="fg-hop">' +
  '<g class="fg-face" transform="translate(0.45 0)" fill="none" stroke="#0a0a0b" stroke-width="10.235" stroke-linecap="round">' +
  '<path d="M-24.560,-44.814 L-22.088,-45.977 C-15.264,-49.188 -7.626,-50.988 0.453,-50.988 C8.283,-50.988 15.698,-49.298 22.359,-46.271 L24.771,-45.174 M46.676,-23.751 C50.712,-16.392 53.004,-7.963 53.004,1.010 C53.004,29.681 29.523,53.008 0.453,53.008 C-28.617,53.008 -52.099,29.681 -52.099,1.010 C-52.099,-7.555 -50.010,-15.624 -46.311,-22.738"/>' +
  '<path class="fg-ear fg-ear-l" d="M-46.311,-22.738 L-44.995,-25.270 L-46.457,-27.719 C-49.984,-33.633 -52.152,-40.296 -52.741,-47.232 C-53.004,-50.319 -50.387,-53.009 -47.120,-52.737 C-39.910,-52.136 -32.998,-49.884 -26.902,-46.221 L-24.560,-44.814"/>' +
  '<path class="fg-ear fg-ear-r" d="M24.771,-45.174 L27.058,-46.510 C33.034,-50.002 39.769,-52.152 46.787,-52.737 C50.053,-53.009 52.670,-50.319 52.408,-47.232 C51.852,-40.685 49.888,-34.382 46.703,-28.721 L45.309,-26.243 L46.676,-23.751"/>' +
  '</g>' +
  '<g class="fg-eyes"><g class="fg-eyehop"><g class="fg-blink" fill="#0a0a0b">' +
  '<circle class="fg-eye fg-eye-l" cx="-12.5" cy="-10" r="6.25"/>' +
  '<circle class="fg-eye fg-eye-r" cx="12.5" cy="-10" r="6.25"/>' +
  '</g></g></g>' +
  '</g></g>' +
  '</svg>';

export const logoMarks = { finguide: finguideMark } as const;

export type LogoMark = keyof typeof logoMarks;
