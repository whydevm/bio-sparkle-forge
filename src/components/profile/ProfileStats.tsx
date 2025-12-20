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
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
      <div 
        className="px-4 py-2.5 rounded-xl flex items-center gap-6 backdrop-blur-md"
        style={{
          backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
          borderWidth: profileOpacity === 0 ? "0" : "1px",
          borderColor: profileOpacity === 0 ? "transparent" : "hsl(var(--border))",
        }}
      >
        {/* Views */}
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          <span className="text-sm font-medium">
            <CountUpAnimation target={viewCount} duration={800} />
          </span>
        </div>

        {/* Location */}
        {location && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">{location}</span>
            </div>
          </>
        )}

        {/* Date */}
        {formattedDate && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Like/Dislike buttons */}
      <div 
        className="px-3 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md"
        style={{
          backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
          borderWidth: profileOpacity === 0 ? "0" : "1px",
          borderColor: profileOpacity === 0 ? "transparent" : "hsl(var(--border))",
        }}
      >
        <button className="p-1 hover:bg-muted rounded transition-colors">
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button className="p-1 hover:bg-muted rounded transition-colors">
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProfileStats;
