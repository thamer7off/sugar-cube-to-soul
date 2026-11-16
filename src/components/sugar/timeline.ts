// Scroll choreography for the sugar cube -> person scene. `p` is 0..1 progress through the pinned track.

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Rounded inset card at rest, full bleed once the explosion starts. */
export function stageExpand(p: number, viewportWidth: number) {
  const e = easeInOut(range(p, 0, 0.1));
  return {
    top: viewportWidth * 0.0177 * (1 - e),
    side: viewportWidth * 0.0224 * (1 - e),
    radius: viewportWidth * 0.012 * (1 - e),
  };
}

export const heroFade = (p: number) => 1 - easeOut(range(p, 0.012, 0.085));

export function chapterReveal(p: number) {
  return {
    heading: easeOut(range(p, 0.3, 0.4)),
    info: easeOut(range(p, 0.33, 0.43)),
    cards: [0, 1, 2, 3].map((i) => easeOut(range(p, 0.34 + i * 0.03, 0.45 + i * 0.03))),
  };
}

/**
 * Film timing (8s clip): 0–1.4s cube turns, 1.4–3.4s burst, 3.4–6s swirl, 6–8s the head forms.
 * The swirl is passed quickly so the scroll lingers on the burst and the finished face.
 */
export function videoTimeFor(p: number, duration: number, now = 0) {
  const d = duration;
  let t: number;
  if (p < 0.06) t = lerp(0, 0.5, p / 0.06);
  else if (p < 0.42) t = lerp(0.5, 3.5, range(p, 0.06, 0.42));
  else if (p < 0.48) t = lerp(3.5, 6.0, range(p, 0.42, 0.48));
  else t = lerp(6.0, d - 0.05, range(p, 0.48, 0.88));
  // Idle sway of the cube while the visitor rests at the very top
  const rest = 1 - range(p, 0, 0.02);
  const sway = 0.45 * (0.5 - 0.5 * Math.cos(now / 1500));
  return Math.min(d - 0.05, Math.max(t, sway * rest));
}
