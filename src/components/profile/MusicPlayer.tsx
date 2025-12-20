import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, ExternalLink, Music } from "lucide-react";

interface MusicItem {
  id: string;
  title: string;
  url: string;
  type: string;
  cover_url?: string;
}

interface MusicPlayerProps {
  music: MusicItem[];
  audioRef?: React.RefObject<HTMLAudioElement>;
  shuffle?: boolean;
}

const MusicPlayer = ({ music, audioRef: externalAudioRef, shuffle }: MusicPlayerProps) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playedTracks, setPlayedTracks] = useState<number[]>([]);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRefInternal = externalAudioRef || internalAudioRef;

  useEffect(() => {
    if (audioRefInternal.current) {
      audioRefInternal.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRefInternal.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioRefInternal]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (audioRefInternal.current) {
      if (isPlaying) {
        audioRefInternal.current.pause();
      } else {
        audioRefInternal.current.play();
      }
    }
  };

  const nextTrack = () => {
    if (shuffle && music.length > 1) {
      const availableTracks = music
        .map((_, index) => index)
        .filter(index => index !== currentTrack && !playedTracks.includes(index));
      
      if (availableTracks.length === 0) {
        setPlayedTracks([]);
        const randomIndex = Math.floor(Math.random() * music.length);
        setCurrentTrack(randomIndex);
        setPlayedTracks([randomIndex]);
      } else {
        const randomIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        setCurrentTrack(randomIndex);
        setPlayedTracks([...playedTracks, randomIndex]);
      }
    } else {
      setCurrentTrack((prev) => (prev + 1) % music.length);
    }
    setCurrentTime(0);
  };

  const prevTrack = () => {
    if (currentTime > 3 && audioRefInternal.current) {
      audioRefInternal.current.currentTime = 0;
    } else {
      setCurrentTrack((prev) => (prev - 1 + music.length) % music.length);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRefInternal.current) {
      audioRefInternal.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const currentMusic = music[currentTrack];

  return (
    <div className="w-full p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border">
      <div className="flex items-center gap-4">
        {/* Music icon or cover */}
        <div className="flex-shrink-0">
          {currentMusic?.cover_url ? (
            <img 
              src={currentMusic.cover_url} 
              alt={currentMusic.title}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>

        {/* Title with external link */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{currentMusic?.title || "Untitled"}</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Time and progress */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground min-w-[32px]">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
          />
          <span className="text-xs text-muted-foreground min-w-[32px]">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevTrack}
            className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <audio
        ref={audioRefInternal}
        src={currentMusic?.url}
        onEnded={nextTrack}
      />
    </div>
  );
};

export default MusicPlayer;
