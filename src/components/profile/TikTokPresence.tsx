import { useEffect, useState } from "react";
import { FaTiktok } from "react-icons/fa";
import { ExternalLink } from "lucide-react";

interface TikTokPresenceProps {
  username: string;
}

interface TikTokData {
  followers: number;
  likes: number;
  avatar: string;
  displayName: string;
}

const TikTokPresence = ({ username }: TikTokPresenceProps) => {
  const [data, setData] = useState<TikTokData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Since we can't directly access TikTok API without backend,
    // we'll show a static card that links to their profile
    setLoading(false);
    setData({
      followers: 0,
      likes: 0,
      avatar: "",
      displayName: username
    });
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md animate-pulse min-w-[280px]">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="w-24 h-4 bg-muted rounded" />
          <div className="w-20 h-3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md hover:border-foreground/40 transition-all duration-300 min-w-[280px]">
      {/* TikTok Icon */}
      <div className="relative flex-shrink-0">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#000000" }}
        >
          <FaTiktok className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* User info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm truncate">
            @{username}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-foreground/60">
          <span>TikTok</span>
        </div>
      </div>

      {/* View Profile Button */}
      <a
        href={`https://tiktok.com/@${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-foreground/10"
      >
        <ExternalLink className="w-3 h-3" />
        <span>View</span>
      </a>
    </div>
  );
};

export default TikTokPresence;
