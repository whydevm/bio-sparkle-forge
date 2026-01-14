import { Eye, Calendar, ThumbsUp, ThumbsDown, MapPin } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  insideCard?: boolean;
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
  insideCard = false,
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
  const likes = 0;
  const dislikes = 0;

  // Inside card variant - shows stats at bottom of profile card
  if (insideCard) {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {showViews && (
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>
                {viewsAnimation ? (
                  <CountUpAnimation target={viewCount} duration={400} />
                ) : (
                  viewCount.toLocaleString()
                )}
              </span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </div>
          )}
          {showJoinDate && formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
        {showLikes && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{likes}</span>
            </button>
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{dislikes}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fixed position stats (legacy mode)
  return (
    <>
      {/* Main stats in bottom left */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded-lg bg-transparent border border-foreground/20">
          {/* Views */}
          {showViews && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-foreground/80 cursor-default">
                    <Eye className="w-3 h-3" />
                    <span className="font-medium">
                      {viewsAnimation ? (
                        <CountUpAnimation target={viewCount} duration={400} />
                      ) : (
                        viewCount.toLocaleString()
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-lg">
                  <p className="font-medium">Views</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Location */}
          {location && (
            <>
              {showViews && <div className="w-px h-2.5 bg-foreground/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-foreground/80 cursor-default">
                      <MapPin className="w-3 h-3" />
                      <span className="font-medium">{location}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-lg">
                    <p className="font-medium">Location</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {/* Date */}
          {showJoinDate && formattedDate && (
            <>
              {(showViews || location) && <div className="w-px h-2.5 bg-foreground/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-foreground/80 cursor-default">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-lg">
                    <p className="font-medium">Join Date</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Likes/Dislikes in bottom right */}
      {showLikes && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] rounded-lg bg-transparent border border-foreground/20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 hover:opacity-80 text-foreground/80 transition-opacity cursor-pointer">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-medium">{likes}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-lg">
                  <p className="font-medium">Like</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-2.5 bg-foreground/20" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 hover:opacity-80 text-foreground/80 transition-opacity cursor-pointer">
                    <ThumbsDown className="w-3 h-3" />
                    <span className="font-medium">{dislikes}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-lg">
                  <p className="font-medium">Dislike</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileStats;
