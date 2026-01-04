import { Eye, MapPin, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <>
      {/* Main stats in bottom left */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-4 px-3 py-1.5 text-xs">
          {/* Views */}
          {showViews && (
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Views: {viewCount.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Location */}
          {location && (
            <>
              {showViews && <div className="w-px h-3 bg-foreground/30" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-foreground cursor-default">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-medium">{location}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Location: {location}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Date */}
          {showJoinDate && formattedDate && (
            <>
              {(showViews || location) && <div className="w-px h-3 bg-foreground/30" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-foreground cursor-default">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Joined: {formattedDate}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Likes/Dislikes in bottom right */}
      {showLikes && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1 p-1 hover:opacity-80 text-foreground transition-opacity cursor-pointer">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">0</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Likes: 0</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1 p-1 hover:opacity-80 text-foreground transition-opacity cursor-pointer">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="font-medium">0</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dislikes: 0</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileStats;
