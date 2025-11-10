import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward } from "lucide-react";

interface Music {
  id: string;
  title: string;
  url: string;
  type: string;
  cover_url?: string;
}

interface MusicPlayerProps {
  music: Music[];
  audioRef?: React.RefObject<HTMLAudioElement>;
}

const MusicPlayer = ({ music, audioRef: externalAudioRef }: MusicPlayerProps) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRefInternal = externalAudioRef || internalAudioRef;

  useEffect(() => {
    if (audioRefInternal.current) {
      audioRefInternal.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRefInternal.current) {
      if (isPlaying) {
        audioRefInternal.current.pause();
      } else {
        audioRefInternal.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % music.length);
    setIsPlaying(false);
  };

  return (
    <div className="glass-panel p-3 rounded-xl">
      <div className="flex items-center gap-3">
        {/* Album Cover */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/20 rounded-lg overflow-hidden">
            {music[currentTrack]?.cover_url ? (
              <img 
                src={music[currentTrack].cover_url} 
                alt={music[currentTrack]?.title || "Album cover"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-[10px] text-center mt-1 text-green-500 font-semibold">ACTIVE</div>
        </div>

        {/* Track info and controls */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">
            {music[currentTrack]?.title || "Untitled"}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={togglePlay}
              className="w-6 h-6 flex items-center justify-center bg-primary hover:bg-primary/90 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 text-primary-foreground" />
              ) : (
                <Play className="w-3 h-3 text-primary-foreground ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded-full transition-colors"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 ml-auto">
              <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRefInternal}
        src={music[currentTrack]?.url}
        onEnded={nextTrack}
      />
    </div>
  );
};

export default MusicPlayer;
