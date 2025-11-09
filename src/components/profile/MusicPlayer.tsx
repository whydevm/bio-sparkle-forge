import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";

interface Music {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface MusicPlayerProps {
  music: Music[];
  audioRef?: React.RefObject<HTMLAudioElement>;
}

const MusicPlayer = ({ music, audioRef: externalAudioRef }: MusicPlayerProps) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % music.length);
    setIsPlaying(false);
  };

  const currentMusic = music[currentTrack];

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4">
      <div className="text-sm font-medium text-center">{currentMusic.title}</div>
      
      <div className="flex items-center justify-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        
        {music.length > 1 && (
          <Button
            size="icon"
            variant="ghost"
            onClick={nextTrack}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>

      <audio
        ref={audioRef}
        src={currentMusic.url}
        onEnded={music.length > 1 ? nextTrack : undefined}
      />
    </div>
  );
};

export default MusicPlayer;