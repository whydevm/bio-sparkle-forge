import { useEffect, useState, useRef } from "react";
import { FaSpotify } from "react-icons/fa";

interface SpotifyPresenceProps {
  userId: string;
}

interface SpotifyData {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: {
    start: number;
    end: number;
  };
}

interface LanyardData {
  spotify: SpotifyData | null;
  listening_to_spotify: boolean;
  discord_status: string;
}

const SpotifyPresence = ({ userId }: SpotifyPresenceProps) => {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      if (!userId) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch Lanyard data");
        }
        const data = await response.json();
        
        if (data.success && data.data) {
          const lanyardData = data.data as LanyardData;
          setIsListening(lanyardData.listening_to_spotify || false);
          setSpotifyData(lanyardData.spotify);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Spotify presence error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
    const interval = setInterval(fetchSpotifyData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Progress bar animation
  useEffect(() => {
    if (!spotifyData?.timestamps) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const now = Date.now();
      const start = spotifyData.timestamps.start;
      const end = spotifyData.timestamps.end;
      const duration = end - start;
      const elapsed = now - start;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setProgress(percentage);

      if (percentage < 100) {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [spotifyData]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md animate-pulse min-w-[280px]">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="w-24 h-4 bg-muted rounded" />
          <div className="w-20 h-3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md min-w-[280px]">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#1DB954" }}
        >
          <FaSpotify className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Spotify</p>
          <p className="text-xs text-foreground/60">User not on Lanyard</p>
        </div>
      </div>
    );
  }

  if (!isListening || !spotifyData) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md min-w-[280px]">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#1DB954" }}
        >
          <FaSpotify className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Spotify</p>
          <p className="text-xs text-foreground/60">Not playing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md hover:border-foreground/40 transition-all duration-300 min-w-[280px]">
      {/* Album art */}
      <div className="relative flex-shrink-0">
        <img
          src={spotifyData.album_art_url}
          alt={spotifyData.album}
          className="w-12 h-12 rounded-lg object-cover shadow-lg"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center shadow-md">
          <FaSpotify className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Song info */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground text-sm truncate">
          {spotifyData.song}
        </p>
        <p className="text-xs text-foreground/60 truncate">
          {spotifyData.artist}
        </p>
        
        {/* Progress bar */}
        <div className="mt-1.5 h-1 bg-foreground/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#1DB954] rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPresence;