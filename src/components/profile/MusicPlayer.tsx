import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from "lucide-react";

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
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex items-center gap-3 px-4 py-3">
      {/* Album art / cover */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-foreground/10">
        {currentMusic?.cover_url ? (
          <img 
            src={currentMusic.cover_url} 
            alt={currentMusic.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-foreground/50" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
        <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
          {currentMusic?.title || "Untitled"}
        </span>
      </div>

      {/* Time and progress */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-foreground/60 tabular-nums w-8 text-right flex-shrink-0">
          {formatTime(currentTime)}
        </span>
        <div className="relative flex-1 h-1 bg-foreground/20 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-foreground/60 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-xs text-foreground/60 tabular-nums w-8 flex-shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={prevTrack}
          className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          <SkipBack className="w-4 h-4" fill="currentColor" />
        </button>

        <button
          onClick={togglePlay}
          className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5" fill="currentColor" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          <SkipForward className="w-4 h-4" fill="currentColor" />
        </button>

        <button className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors">
          <Volume2 className="w-4 h-4" />
        </button>
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
