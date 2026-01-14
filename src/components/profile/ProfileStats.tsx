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
  const likes = 31;
  const dislikes = 2;

  // Tooltip content component for consistent styling
  const StyledTooltipContent = ({ label, count }: { label: string; count?: number | string }) => (
    <TooltipContent 
      side="top" 
      className="bg-card/95 backdrop-blur-md border border-foreground/20 px-3 py-2 rounded-xl shadow-lg"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">({count})</span>
        )}
      </div>
    </TooltipContent>
  );

  // Inside card variant - shows stats at bottom of profile card
  if (insideCard) {
    return (
      <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {showViews && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default hover:text-foreground transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">
                      {viewsAnimation ? (
                        <CountUpAnimation target={viewCount} duration={400} />
                      ) : (
                        viewCount.toLocaleString()
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <StyledTooltipContent label="Views" count={viewCount.toLocaleString()} />
              </Tooltip>
            </TooltipProvider>
          )}
          {location && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default hover:text-foreground transition-colors">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{location}</span>
                  </div>
                </TooltipTrigger>
                <StyledTooltipContent label="Location" />
              </Tooltip>
            </TooltipProvider>
          )}
          {showJoinDate && formattedDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default hover:text-foreground transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                </TooltipTrigger>
                <StyledTooltipContent label="Join Date" />
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {showLikes && (
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">{likes}</span>
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Like" count={likes} />
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                    <span className="font-medium">{dislikes}</span>
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Dislike" count={dislikes} />
              </Tooltip>
            </TooltipProvider>
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
        <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl bg-background/40 backdrop-blur-md border border-foreground/20">
          {/* Views */}
          {showViews && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-foreground/80 cursor-default hover:text-foreground transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">
                      {viewsAnimation ? (
                        <CountUpAnimation target={viewCount} duration={400} />
                      ) : (
                        viewCount.toLocaleString()
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <StyledTooltipContent label="Views" count={viewCount.toLocaleString()} />
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Location */}
          {location && (
            <>
              {showViews && <div className="w-px h-4 bg-foreground/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-foreground/80 cursor-default hover:text-foreground transition-colors">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{location}</span>
                    </div>
                  </TooltipTrigger>
                  <StyledTooltipContent label="Location" />
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {/* Date */}
          {showJoinDate && formattedDate && (
            <>
              {(showViews || location) && <div className="w-px h-4 bg-foreground/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-foreground/80 cursor-default hover:text-foreground transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                  </TooltipTrigger>
                  <StyledTooltipContent label="Join Date" />
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Likes/Dislikes in bottom right */}
      {showLikes && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-3 px-3 py-2 text-xs rounded-xl bg-background/40 backdrop-blur-md border border-foreground/20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-foreground text-foreground/80 transition-colors cursor-pointer">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">{likes}</span>
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Like" count={likes} />
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-foreground/20" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-foreground text-foreground/80 transition-colors cursor-pointer">
                    <ThumbsDown className="w-4 h-4" />
                    <span className="font-medium">{dislikes}</span>
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Dislike" count={dislikes} />
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileStats;
