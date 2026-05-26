import { useEffect, useMemo, useRef, useState } from "react";
import { parseLRC, findActiveLineIndex, type LyricLine } from "@/lib/lrc";

interface SyncedLyricsProps {
  lrc?: string | null;
  plain?: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  coverUrl?: string;
}

const SyncedLyrics = ({ lrc, plain, audioRef, coverUrl }: SyncedLyricsProps) => {
  const lines = useMemo<LyricLine[]>(() => parseLRC(lrc), [lrc]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !lines.length) return;
    let raf = 0;
    const tick = () => {
      const idx = findActiveLineIndex(lines, audio.currentTime);
      setActiveIdx((prev) => (prev === idx ? prev : idx));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines, audioRef]);

  useEffect(() => {
    const el = lineRefs.current[activeIdx];
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIdx]);

  const handleSeek = (t: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      audioRef.current.play().catch(() => {});
    }
  };

  if (!lines.length && !plain) return null;

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl">
      {/* Blurred backdrop from album art */}
      {coverUrl && (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center scale-125 blur-3xl opacity-40"
          style={{ backgroundImage: `url(${coverUrl})` }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden />

      {lines.length === 0 && plain ? (
        <div className="p-5 max-h-64 overflow-y-auto text-white/70 text-sm whitespace-pre-line leading-relaxed">
          {plain}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="p-5 max-h-64 overflow-y-auto scroll-smooth space-y-2 [mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_80%,transparent)]"
        >
          {lines.map((line, i) => {
            const isActive = i === activeIdx;
            const isPast = i < activeIdx;
            return (
              <button
                key={`${line.time}-${i}`}
                ref={(el) => (lineRefs.current[i] = el)}
                onClick={() => handleSeek(line.time)}
                className={`block w-full text-left font-ggsans transition-all duration-500 ease-out leading-snug ${
                  isActive
                    ? "text-white text-2xl font-bold scale-[1.02] drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)]"
                    : isPast
                    ? "text-white/30 text-lg blur-[1px]"
                    : "text-white/40 text-lg blur-[1px] hover:text-white/70 hover:blur-0"
                }`}
              >
                {line.text || "♪"}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SyncedLyrics;
