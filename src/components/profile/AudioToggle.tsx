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
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
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
    setIsExpanded(true);
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
        className="w-10 h-10 rounded-full bg-transparent border border-foreground/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 hover:border-foreground/40"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-5 h-5 text-foreground" />
        ) : (
          <Volume2 className="w-5 h-5 text-foreground" />
        )}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? "w-24 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="px-3 py-2 rounded-full bg-transparent border border-foreground/20 backdrop-blur-sm">
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
