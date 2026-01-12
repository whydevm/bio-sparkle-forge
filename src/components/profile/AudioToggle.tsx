import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioToggleProps {
  audioRef: React.RefObject<HTMLAudioElement | HTMLVideoElement>;
}

const AudioToggle = ({ audioRef }: AudioToggleProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
      // Hide slider when muting, show when unmuting
      setIsExpanded(!newMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      if (newVolume === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isMuted) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex items-center gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={toggleMute}
        className="w-9 h-9 rounded-lg bg-transparent border border-foreground/20 flex items-center justify-center transition-all hover:scale-105 hover:border-foreground/40"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-4 h-4 text-foreground" />
        ) : (
          <Volume2 className="w-4 h-4 text-foreground" />
        )}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded && !isMuted ? "w-24 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="px-3 py-2 rounded-lg bg-transparent border border-foreground/20">
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            min={0}
            step={1}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-foreground/20 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-foreground [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioToggle;