import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Music, Mic2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import SyncedLyrics from "./SyncedLyrics";

interface MusicItem {
  id: string;
  title: string;
  url: string;
  type: string;
  cover_url?: string;
  artist?: string | null;
  lrc?: string | null;
}

interface PremiumMusicPlayerProps {
  music: MusicItem[];
  audioRef?: React.RefObject<HTMLAudioElement>;
  shuffle?: boolean;
  profileOpacity?: number;
  globalRadius?: number;
}

const PremiumMusicPlayer = ({ 
  music, 
  audioRef: externalAudioRef, 
  shuffle = false,
  profileOpacity = 100,
  globalRadius = 50,
}: PremiumMusicPlayerProps) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(shuffle);
  const [showLyrics, setShowLyrics] = useState(false);
  const [playedTracks, setPlayedTracks] = useState<number[]>([]);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRefInternal = externalAudioRef || internalAudioRef;

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;
  const opacity = profileOpacity / 100;

  useEffect(() => {
    if (audioRefInternal.current) {
      audioRefInternal.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    if (shuffleEnabled && music.length > 1) {
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

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (audioRefInternal.current) {
      audioRefInternal.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const currentMusic = music[currentTrack];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="font-ggsans w-full max-w-lg backdrop-blur-xl border border-white/10 p-4"
      style={{ 
        borderRadius,
        backgroundColor: `rgba(0, 0, 0, ${opacity * 0.6})`,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Album art */}
        <div 
          className="flex-shrink-0 w-16 h-16 overflow-hidden bg-white/10"
          style={{ borderRadius: `${Math.round((globalRadius / 100) * 12)}px` }}
        >
          {currentMusic?.cover_url ? (
            <img 
              src={currentMusic.cover_url} 
              alt={currentMusic.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white/50" />
            </div>
          )}
        </div>

        {/* Title and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white truncate max-w-[160px]">
              {currentMusic?.title || "Untitled"}
            </span>
            
            {/* Track counter */}
            <span className="text-xs text-white/50">
              {currentTrack + 1}/{music.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 tabular-nums w-9">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/20 [&_[role=slider]]:w-3.5 [&_[role=slider]]:h-3.5 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-white/80"
            />
            <span className="text-xs text-white/60 tabular-nums w-9 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setShuffleEnabled(!shuffleEnabled)}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
            shuffleEnabled ? 'text-white bg-white/20' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={prevTrack}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <SkipBack className="w-5 h-5" fill="currentColor" />
        </button>

        <button
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <SkipForward className="w-5 h-5" fill="currentColor" />
        </button>

        <div 
          className="relative"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button 
            onClick={toggleMute}
            className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {showVolume && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-black/80 backdrop-blur-xl rounded-xl">
              <Slider
                value={[volume * 100]}
                onValueChange={([value]) => setVolume(value / 100)}
                max={100}
                step={1}
                orientation="vertical"
                className="h-20 [&>span:first-child]:w-1.5 [&>span:first-child]:bg-white/20 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&>span:first-child>span]:bg-white/80"
              />
            </div>
          )}
        </div>

        {(currentMusic?.lrc) && (
          <button
            onClick={() => setShowLyrics((v) => !v)}
            aria-label="Toggle lyrics"
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
              showLyrics ? 'text-white bg-white/20' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {showLyrics && currentMusic?.lrc && (
        <SyncedLyrics
          lrc={currentMusic.lrc}
          audioRef={audioRefInternal}
          coverUrl={currentMusic.cover_url}
        />
      )}

      <audio
        ref={audioRefInternal}
        src={currentMusic?.url}
        onEnded={nextTrack}
      />
    </div>
  );
};

export default PremiumMusicPlayer;
