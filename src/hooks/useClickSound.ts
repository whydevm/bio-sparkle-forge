import { useCallback, useEffect, useRef } from "react";

const DEFAULT_CLICK_SOUND_URL = "https://cdn.freesound.org/previews/256/256116_3263906-lq.mp3";

export const useClickSound = (enabled: boolean, customSoundUrl?: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundUrl = customSoundUrl || DEFAULT_CLICK_SOUND_URL;

  useEffect(() => {
    if (enabled) {
      // Create audio element and preload it
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = 0.3;
      audioRef.current.preload = "auto";
      
      // Load the audio
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled, soundUrl]);

  const playClickSound = useCallback(() => {
    if (enabled && audioRef.current) {
      // Clone the audio to allow overlapping sounds
      const sound = audioRef.current.cloneNode() as HTMLAudioElement;
      sound.volume = 0.3;
      sound.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element or its parents are interactive
      const isInteractive = 
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("[data-clickable]") ||
        target.classList.contains("cursor-pointer") ||
        getComputedStyle(target).cursor === "pointer";
      
      if (isInteractive) {
        playClickSound();
      }
    };

    // Use capture phase to catch clicks before they might be stopped
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [enabled, playClickSound]);

  return playClickSound;
};

export default useClickSound;