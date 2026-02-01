import { Eye, Calendar, ThumbsUp, ThumbsDown, MapPin, Hash } from "lucide-react";
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
  uidNumber,
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

  // Styled tooltip with UID display like reference image
  const UidTooltipContent = ({ uidNum }: { uidNum: number }) => (
    <TooltipContent 
      side="top" 
      className="bg-black/95 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl"
    >
      <div className="flex items-center gap-3 font-ggsans">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center border-2 border-white/20">
          <span className="text-white font-bold text-xs">UID</span>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-0.5">User ID</div>
          <div className="text-xl font-bold text-white">{uidNum}</div>
        </div>
      </div>
    </TooltipContent>
  );

  // Tooltip content component - smaller, rounded, black background
  const StyledTooltipContent = ({ label, count, showCount = false }: { label: string; count?: number | string; showCount?: boolean }) => (
    <TooltipContent 
      side="top" 
      className="bg-black/95 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl"
    >
      <span className="text-sm font-medium text-white font-ggsans">
        {showCount && count !== undefined ? `${count} ${label}` : label}
      </span>
    </TooltipContent>
  );

  // Inside card variant - shows stats at bottom of profile card
  if (insideCard) {
    return (
      <div className="flex items-center justify-between text-sm text-white/70 flex-wrap gap-3 font-ggsans">
        <div className="flex items-center gap-4 flex-wrap">
          {/* UID Number */}
          {uidNumber && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default hover:text-white transition-colors">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium">{uidNumber}</span>
                  </div>
                </TooltipTrigger>
                <UidTooltipContent uidNum={uidNumber} />
              </Tooltip>
            </TooltipProvider>
          )}
          {showViews && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default hover:text-white transition-colors">
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
                <StyledTooltipContent label="Views" />
              </Tooltip>
            </TooltipProvider>
          )}
          {location && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default hover:text-white transition-colors">
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
                  <div className="flex items-center gap-1.5 cursor-default hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                </TooltipTrigger>
                <StyledTooltipContent label="Joined" />
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {showLikes && (
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Likes" count={likes} showCount />
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Dislikes" count={dislikes} showCount />
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
        <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 font-ggsans">
          {/* UID Number */}
          {uidNumber && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-white/80 cursor-default hover:text-white transition-colors">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium">{uidNumber}</span>
                  </div>
                </TooltipTrigger>
                <UidTooltipContent uidNum={uidNumber} />
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Views */}
          {showViews && (
            <>
              {uidNumber && <div className="w-px h-4 bg-white/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-white/80 cursor-default hover:text-white transition-colors">
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
                  <StyledTooltipContent label="Views" />
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {/* Location */}
          {location && (
            <>
              {(showViews || uidNumber) && <div className="w-px h-4 bg-white/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-white/80 cursor-default hover:text-white transition-colors">
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
              {(showViews || location || uidNumber) && <div className="w-px h-4 bg-white/20" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-white/80 cursor-default hover:text-white transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                  </TooltipTrigger>
                  <StyledTooltipContent label="Joined" />
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Likes/Dislikes in bottom right - only icons, count shows on hover */}
      {showLikes && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-3 px-3 py-2 text-xs rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 font-ggsans">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-white text-white/80 transition-colors cursor-pointer">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Likes" count={likes} showCount />
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-white/20" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-white text-white/80 transition-colors cursor-pointer">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <StyledTooltipContent label="Dislikes" count={dislikes} showCount />
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileStats;
