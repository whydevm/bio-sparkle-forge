import { Eye, MapPin, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { format } from "date-fns";

interface ProfileStatsProps {
  viewCount: number;
  location?: string;
  createdAt?: string;
  profileOpacity: number;
  showViews?: boolean;
  showJoinDate?: boolean;
  showLikes?: boolean;
  viewsAnimation?: boolean;
  displayName?: string;
  userId?: string;
  joinDateFormat?: string;
  joinTimeFormat?: string;
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
  displayName,
  userId,
  joinDateFormat = "MMM dd, yyyy",
  joinTimeFormat = "12h",
}: ProfileStatsProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    try {
      let formatted = format(date, joinDateFormat);
      if (joinTimeFormat === "12h") {
        formatted += ` ${format(date, "h:mm a")}`;
      } else if (joinTimeFormat === "24h") {
        formatted += ` ${format(date, "HH:mm")}`;
      }
      return formatted;
    } catch {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
    }
  };

  const formattedDate = formatDate(createdAt);

  return (
    <>
      {/* Main stats in bottom left */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-4 px-3 py-1.5 text-xs">
          {/* Views */}
          {showViews && (
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 text-foreground cursor-default">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {viewsAnimation ? (
                      <CountUpAnimation target={viewCount} duration={400} />
                    ) : (
                      viewCount.toLocaleString()
                    )}
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">Profile Views</p>
                    <p className="text-xs text-muted-foreground">{viewCount.toLocaleString()} total views</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}

          {/* Location */}
          {location && (
            <>
              {showViews && <div className="w-px h-3 bg-foreground/30" />}
              <HoverCard openDelay={100} closeDelay={50}>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-1.5 text-foreground cursor-default">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-medium">{location}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Location</p>
                      <p className="text-xs text-muted-foreground">{location}</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </>
          )}

          {/* Date */}
          {showJoinDate && formattedDate && (
            <>
              {(showViews || location) && <div className="w-px h-3 bg-foreground/30" />}
              <HoverCard openDelay={100} closeDelay={50}>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-1.5 text-foreground cursor-default">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Join Date</p>
                      <p className="text-xs text-muted-foreground">Joined on {formattedDate}</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </>
          )}
        </div>
      </div>

      {/* Likes/Dislikes in bottom right */}
      {showLikes && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 text-xs">
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <button className="flex items-center gap-1 p-1 hover:opacity-80 text-foreground transition-opacity cursor-pointer">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">0</span>
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="font-semibold text-sm">Likes</p>
                    <p className="text-xs text-muted-foreground">0 people liked this profile</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <button className="flex items-center gap-1 p-1 hover:opacity-80 text-foreground transition-opacity cursor-pointer">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="font-medium">0</span>
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="font-semibold text-sm">Dislikes</p>
                    <p className="text-xs text-muted-foreground">0 people disliked this profile</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileStats;
