import { useCallback, useEffect, useRef } from "react";

const CLICK_SOUND_URL = "https://cdn.freesound.org/previews/256/256116_3263906-lq.mp3";

export const useClickSound = (enabled: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled) {
      audioRef.current = new Audio(CLICK_SOUND_URL);
      audioRef.current.volume = 0.3;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled]);

  const playClickSound = useCallback(() => {
    if (enabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer")
      ) {
        playClickSound();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [enabled, playClickSound]);

  return playClickSound;
};

export default useClickSound;
