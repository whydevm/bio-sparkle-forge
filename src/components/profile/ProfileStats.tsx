import { Eye, Calendar, ThumbsUp, ThumbsDown, Hash } from "lucide-react";
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
  uidNumber?: number;
  joinDateFormat?: string;
  joinTimeFormat?: string;
}

const ProfileStats = ({ 
  viewCount, 
  createdAt, 
  profileOpacity,
  showViews = true,
  showJoinDate = true,
  showLikes = true,
  viewsAnimation = true,
  displayName,
  userId,
  uidNumber,
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
  const likes = 0;
  const dislikes = 0;

  return (
    <>
      {/* Main stats in bottom left - smaller and rounded like coding badges */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded-full bg-transparent border border-foreground/20 backdrop-blur-sm">
          {/* UID Number */}
          {uidNumber && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-foreground/80 cursor-default">
                    <Hash className="w-3 h-3" />
                    <span className="font-medium font-mono">{uidNumber}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-full">
                  <p className="font-medium">UID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Views */}
          {showViews && (
            <>
              {uidNumber && <div className="w-px h-2.5 bg-foreground/20" />}
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
                  <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-full">
                    <p className="font-medium">Views</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {/* Date */}
          {showJoinDate && formattedDate && (
            <>
              {(showViews || uidNumber) && <div className="w-px h-2.5 bg-foreground/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-foreground/80 cursor-default">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-full">
                    <p className="font-medium">Join Date</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Likes/Dislikes in bottom right - smaller and rounded */}
      {showLikes && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] rounded-full bg-transparent border border-foreground/20 backdrop-blur-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 hover:opacity-80 text-foreground/80 transition-opacity cursor-pointer">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-medium">{likes}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-full">
                  <p className="font-medium">{likes} likes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 hover:opacity-80 text-foreground/80 transition-opacity cursor-pointer">
                    <ThumbsDown className="w-3 h-3" />
                    <span className="font-medium">{dislikes}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs px-2 py-1 rounded-full">
                  <p className="font-medium">{dislikes} dislikes</p>
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
