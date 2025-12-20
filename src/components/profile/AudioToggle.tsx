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
      className="w-14 h-14 rounded-2xl bg-card/80 border border-border backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 hover:bg-card"
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6 text-foreground" />
      ) : (
        <Volume2 className="w-6 h-6 text-foreground" />
      )}
    </button>
  );
};

export default AudioToggle;
