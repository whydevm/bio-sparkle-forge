import { Eye, MapPin, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface ProfileStatsProps {
  viewCount: number;
  location?: string;
  createdAt?: string;
  profileOpacity: number;
  showViews?: boolean;
  showJoinDate?: boolean;
  showLikes?: boolean;
  viewsAnimation?: boolean;
}

const ProfileStats = ({ 
  viewCount, 
  location, 
  createdAt, 
  profileOpacity,
  showViews = true,
  showJoinDate = true,
  showLikes = true,
  viewsAnimation = true,
}: ProfileStatsProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const formattedDate = formatDate(createdAt);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-4 px-3 py-1.5 text-xs">
        {/* Views */}
        {showViews && (
          <div className="flex items-center gap-1.5 text-foreground/80">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-medium">
              {viewsAnimation ? (
                <CountUpAnimation target={viewCount} duration={400} />
              ) : (
                viewCount.toLocaleString()
              )}
            </span>
          </div>
        )}

        {/* Location */}
        {location && (
          <>
            {showViews && <div className="w-px h-3 bg-foreground/20" />}
            <div className="flex items-center gap-1.5 text-foreground/80">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">{location}</span>
            </div>
          </>
        )}

        {/* Date */}
        {showJoinDate && formattedDate && (
          <>
            {(showViews || location) && <div className="w-px h-3 bg-foreground/20" />}
            <div className="flex items-center gap-1.5 text-foreground/80">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">{formattedDate}</span>
            </div>
          </>
        )}

        {/* Like/Dislike buttons */}
        {showLikes && (
          <>
            {(showViews || location || (showJoinDate && formattedDate)) && <div className="w-px h-3 bg-foreground/20" />}
            <div className="flex items-center gap-1">
              <button className="p-0.5 hover:text-foreground text-foreground/80 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button className="p-0.5 hover:text-foreground text-foreground/80 transition-colors">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileStats;
