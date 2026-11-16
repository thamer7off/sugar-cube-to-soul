import { useEffect, useRef } from "react";
import { ConciergeBell, ShieldCheck, SquareX } from "lucide-react";

import { Button } from "@/components/ui/button";
import transformVideo from "@/assets/sugar-transform.mp4.asset.json";
import cubePoster from "@/assets/sugar-cube-poster.jpg.asset.json";
import { chapterReveal, heroFade, stageExpand, videoTimeFor } from "./timeline";

function BoltCircle(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M13 6.5 8.5 13h4l-1 4.5L16 11h-4l1-4.5Z" />
    </svg>
  );
}

const pillars = [
  {
    n: "01",
    title: "Nutrition",
    body: "Balanced meals slow glucose spikes and help maintain steady energy throughout the day.",
    Icon: ConciergeBell,
  },
  {
    n: "02",
    title: "Recovery",
    body: "Poor sleep can affect insulin sensitivity even after a single night.",
    Icon: BoltCircle,
  },
  {
    n: "03",
    title: "Movement",
    body: "Physical activity naturally improves the body’s ability to regulate glucose.",
    Icon: SquareX,
  },
  {
    n: "04",
    title: "Prevention",
    body: "Knowing your baseline is often the first step toward preventing serious complications.",
    Icon: ShieldCheck,
  },
];

export function SugarExperience() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!track || !stage || !video) return;

    let raf = 0;
    let shownTime = 0;
    let duration = 8;

    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
    };
    video.addEventListener("loadedmetadata", onMeta);
    onMeta();

    // iOS only paints seeked frames after the video has been played once.
    const unlock = () => {
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });

    const apply = (el: HTMLElement | null, k: number, lift: number, blur: number) => {
      if (!el) return;
      el.style.opacity = String(k);
      el.style.transform = `translate3d(0, ${(1 - k) * lift}px, 0)`;
      el.style.filter = blur ? `blur(${(1 - k) * blur}px)` : "";
    };

    const tick = (now: number) => {
      const rect = track.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / span));
      const w = window.innerWidth;

      // Stage: inset rounded card -> full bleed
      const s = stageExpand(p, w);
      stage.style.top = `${s.top}px`;
      stage.style.left = `${s.side}px`;
      stage.style.right = `${s.side}px`;
      stage.style.borderTopLeftRadius = `${s.radius}px`;
      stage.style.borderTopRightRadius = `${s.radius}px`;

      // Hero copy blurs away as the scroll begins
      const h = heroFade(p);
      if (heroRef.current) {
        heroRef.current.style.opacity = String(h);
        heroRef.current.style.filter = `blur(${(1 - h) * 14}px)`;
        heroRef.current.style.pointerEvents = h < 0.05 ? "none" : "";
      }

      // Second chapter reveals over the explosion
      const c = chapterReveal(p);
      apply(headingRef.current, c.heading, 18, 12);
      apply(infoRef.current, c.info, 14, 10);
      cardRefs.current.forEach((el, i) => apply(el, c.cards[i] ?? 0, 60, 0));

      // Scrub the cube -> person film, with a gentle idle sway while resting at the top
      const target = videoTimeFor(p, duration, now);
      shownTime += (target - shownTime) * 0.16;
      if (Math.abs(video.currentTime - shownTime) > 1 / 90 && !video.seeking && video.readyState >= 1) {
        video.currentTime = shownTime;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <main>
      <section ref={trackRef} className="relative h-[520vh]" aria-label="Know your sugar">
        <div className="sticky top-0 h-svh overflow-hidden bg-background">
          <div
            ref={stageRef}
            className="animate-stage-open absolute bottom-0 overflow-hidden bg-scene-stage text-scene-foreground"
            style={{ top: "1.77vw", left: "2.24vw", right: "2.24vw", borderRadius: "1.2vw 1.2vw 0 0" }}
          >
            <video
              ref={videoRef}
              src={transformVideo.url}
              poster={cubePoster.url}
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-scene-shade" />

            {/* ---------- Hero ---------- */}
            <div ref={heroRef} className="absolute inset-0 will-change-[opacity,filter]">
              <div className="scene-text-glow absolute left-[6vw] top-[8vw] max-w-[64vw] text-[13px] font-medium leading-[1.55] text-scene-muted md:left-[2.36vw] md:top-[3.4vw] md:max-w-[18vw] md:text-[clamp(12px,1.1vw,20px)]">
                <p className="animate-blur-in [animation-delay:0.85s]">
                  Over [540 million] adults worldwide live with diabetes.
                </p>
                <p className="animate-blur-in mt-[1.1em] [animation-delay:0.95s]">
                  Nearly half don’t know they’re already at risk.
                </p>
              </div>

              <p className="scene-text-glow animate-blur-in absolute right-[2.36vw] top-[3.4vw] hidden max-w-[26vw] text-[clamp(12px,1.1vw,20px)] font-medium leading-[1.55] text-scene-muted [animation-delay:0.95s] md:block">
                Blood sugar changes silently for years. Understanding your numbers today can help
                prevent serious health problems tomorrow.
              </p>

              <div className="absolute inset-x-[6vw] bottom-[6vw] flex flex-col gap-6 md:inset-x-[2.36vw] md:bottom-[1.4vw] md:flex-row md:items-end md:justify-between">
                <h1 className="scene-text-glow text-[clamp(40px,5.7vw,112px)] leading-[1.02] tracking-[-0.025em]">
                  <span className="animate-wipe-in block font-light [animation-delay:1.05s]">
                    Know Your Sugar.
                  </span>
                  <span className="animate-wipe-in block font-serif italic tracking-[-0.01em] [animation-delay:1.25s]">
                    Protect Your Future.
                  </span>
                </h1>
                <div className="animate-blur-in flex gap-[0.9vw] [animation-delay:1.45s] md:pb-[0.6vw]">
                  <Button variant="scene" size="scene">
                    Free risk test
                  </Button>
                  <Button variant="sceneOutline" size="scene">
                    Learn the Basics
                  </Button>
                </div>
              </div>
            </div>

            {/* ---------- Chapter two ---------- */}
            <div
              ref={headingRef}
              className="scene-text-glow absolute left-[6vw] top-[8vw] opacity-0 md:left-[2.36vw] md:top-[3.3vw]"
            >
              <h2 className="text-[clamp(36px,5.15vw,100px)] leading-[1.04] tracking-[-0.025em]">
                <span className="block font-light">Small Numbers.</span>
                <span className="block font-serif italic tracking-[-0.01em]">Big Consequences.</span>
              </h2>
            </div>

            <div
              ref={infoRef}
              className="absolute right-[2.36vw] top-[3.4vw] hidden max-w-[22.5vw] gap-[1.1vw] opacity-0 md:flex"
            >
              <span className="mt-[0.15vw] flex size-[2.15vw] shrink-0 items-center justify-center rounded-[0.45vw] bg-scene-solid font-serif text-[1.35vw] italic text-scene-solid-foreground">
                i
              </span>
              <p className="scene-text-glow text-[clamp(12px,1.1vw,20px)] font-medium leading-[1.6] text-scene-muted">
                Blood sugar is one of the clearest indicators of long-term metabolic health.
                Understanding how it changes can help prevent problems before symptoms appear.
              </p>
            </div>

            <div className="absolute inset-x-[4vw] bottom-[4vw] grid grid-cols-2 gap-3 md:inset-x-[2.36vw] md:bottom-[1.6vw] md:grid-cols-4 md:gap-[1.45vw]">
              {pillars.map(({ n, title, body, Icon }, i) => (
                <div
                  key={n}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="rounded-xl border border-scene-line/20 bg-scene-glass p-4 opacity-0 backdrop-blur-xl md:rounded-[0.95vw] md:px-[1.85vw] md:pb-[1.7vw] md:pt-[1.8vw]"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="size-6 stroke-[1.5] md:size-[2.1vw]" />
                    <span className="text-xs font-light tracking-wide text-scene-muted md:text-[clamp(11px,1.2vw,22px)]">
                      {n}
                    </span>
                  </div>
                  <div className="mt-4 h-px w-2/5 bg-scene-line/45 md:mt-[2.6vw]" />
                  <h3 className="mt-3 text-base font-medium md:mt-[1.75vw] md:text-[clamp(14px,1.55vw,30px)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-[1.55] text-scene-muted md:mt-[0.9vw] md:text-[clamp(11px,1.12vw,20px)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
