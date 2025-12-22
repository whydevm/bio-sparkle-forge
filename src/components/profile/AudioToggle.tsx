import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioToggle = ({ audioRef }: AudioToggleProps) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <button
      onClick={toggleMute}
      className="w-10 h-10 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 hover:bg-foreground/10"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
};

export default AudioToggle;
