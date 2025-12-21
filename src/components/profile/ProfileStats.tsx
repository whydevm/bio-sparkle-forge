import { Eye, MapPin, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface ProfileStatsProps {
  viewCount: number;
  location?: string;
  createdAt?: string;
  profileOpacity: number;
}

const ProfileStats = ({ viewCount, location, createdAt, profileOpacity }: ProfileStatsProps) => {
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
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-4">
      <div 
        className="px-5 py-3 rounded-2xl flex items-center gap-8 bg-card/90 border border-border shadow-lg"
      >
        {/* Views */}
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-foreground" />
          <span className="text-base font-semibold text-foreground">
            <CountUpAnimation target={viewCount} duration={800} />
          </span>
        </div>

        {/* Location */}
        {location && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-foreground" />
              <span className="text-base font-semibold text-foreground">{location}</span>
            </div>
          </>
        )}

        {/* Date */}
        {formattedDate && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-foreground" />
              <span className="text-base font-semibold text-foreground">{formattedDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Like/Dislike buttons */}
      <div 
        className="px-4 py-3 rounded-2xl flex items-center gap-3 bg-card/90 border border-border shadow-lg"
      >
        <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <ThumbsUp className="w-6 h-6 text-foreground" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <ThumbsDown className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ProfileStats;
