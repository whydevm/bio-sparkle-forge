import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  audioRef: React.RefObject<HTMLAudioElement | HTMLVideoElement>;
  profileOpacity?: number;
}

const AudioToggle = ({ audioRef, profileOpacity = 100 }: AudioToggleProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(25);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const updateVolume = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setVolume(percentage);
    if (audioRef.current) {
      audioRef.current.volume = percentage / 100;
      if (percentage === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  }, [audioRef, isMuted]);

  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateVolume(e.clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    updateVolume(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateVolume(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateVolume]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      // Small grace period to avoid flicker
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 150);
    }
  };

  // Apply default low volume on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
    }
  }, [audioRef]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate background opacity based on profile opacity setting
  const bgOpacity = Math.max(0.4, profileOpacity / 100 * 0.6);
  const showSlider = isHovered;

  return (
    <div 
      ref={containerRef}
      className={`flex items-center transition-all duration-500 ease-out ${
        showSlider 
          ? "gap-4 pl-4 pr-5 py-3 rounded-full backdrop-blur-md border border-white/20" 
          : ""
      }`}
      style={{
        backgroundColor: showSlider ? `rgba(0, 0, 0, ${bgOpacity})` : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Audio button */}
      <button
        onClick={toggleMute}
        className={`flex items-center justify-center transition-all duration-500 ease-out ${
          showSlider
            ? "w-7 h-7 rounded-full bg-transparent"
            : "w-12 h-12 rounded-full backdrop-blur-md border border-white/30 hover:border-white/50"
        }`}
        style={{
          backgroundColor: showSlider ? undefined : `rgba(0, 0, 0, ${bgOpacity})`,
        }}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className={`transition-all duration-300 ${showSlider ? "w-6 h-6" : "w-6 h-6"} text-white`} />
        ) : (
          <Volume2 className={`transition-all duration-300 ${showSlider ? "w-6 h-6" : "w-6 h-6"} text-white`} />
        )}
      </button>
      
      {/* Volume slider - shows when hovered */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-out ${
          showSlider ? "w-36 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div 
          ref={sliderRef}
          className="relative h-1 bg-white/25 rounded-full cursor-pointer select-none"
          onClick={handleSliderClick}
          onMouseDown={handleMouseDown}
        >
          {/* Fill */}
          <div 
            className="absolute h-full bg-white/80 rounded-full"
            style={{ width: `${volume}%` }}
          />
          {/* Thumb - circular dot */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing transition-transform duration-100 hover:scale-125"
            style={{ left: `calc(${volume}% - 7px)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioToggle;
