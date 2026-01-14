import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioToggleProps {
  audioRef: React.RefObject<HTMLAudioElement | HTMLVideoElement>;
}

const AudioToggle = ({ audioRef }: AudioToggleProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
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
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show slider when hovered and not muted
  const showSlider = isHovered && !isMuted;

  return (
    <div 
      ref={containerRef}
      className={`flex items-center transition-all duration-300 ease-out ${
        showSlider 
          ? "gap-3 px-4 py-3 rounded-full bg-background/40 backdrop-blur-md border border-foreground/20" 
          : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Audio button - circular design like reference */}
      <button
        onClick={toggleMute}
        className={`flex items-center justify-center transition-all duration-300 ease-out ${
          showSlider
            ? "w-10 h-10 rounded-full bg-transparent"
            : "w-12 h-12 rounded-full bg-background/40 backdrop-blur-md border border-foreground/30 hover:border-foreground/50"
        }`}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className={`transition-all duration-300 ${showSlider ? "w-5 h-5" : "w-6 h-6"} text-foreground`} />
        ) : (
          <Volume2 className={`transition-all duration-300 ${showSlider ? "w-5 h-5" : "w-6 h-6"} text-foreground`} />
        )}
      </button>
      
      {/* Volume slider - only shows when hovered and not muted */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showSlider ? "w-28 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={100}
          min={0}
          step={1}
          className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-foreground/30 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-foreground [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-foreground"
        />
      </div>
    </div>
  );
};

export default AudioToggle;
