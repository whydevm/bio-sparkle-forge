import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaDiscord } from "react-icons/fa";
import { X } from "lucide-react";

interface Activity {
  name: string;
  type: number;
  state?: string;
  details?: string;
  application_id?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
}

interface DiscordActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  activities?: Activity[];
}

const getActivityTypeLabel = (type: number): string => {
  switch (type) {
    case 0: return "Playing";
    case 1: return "Streaming";
    case 2: return "Listening to";
    case 3: return "Watching";
    case 4: return "Custom Status";
    case 5: return "Competing in";
    default: return "Activity";
  }
};

const getAssetUrl = (applicationId?: string, asset?: string): string | null => {
  if (!asset) return null;
  if (asset.startsWith("mp:external")) {
    const externalUrl = asset.replace("mp:external/", "");
    return `https://media.discordapp.net/external/${externalUrl}`;
  }
  if (asset.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${asset.replace("spotify:", "")}`;
  }
  if (applicationId && asset) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${asset}.png`;
  }
  return null;
};

const formatElapsedTime = (startTimestamp?: number): string => {
  if (!startTimestamp) return "";
  const now = Date.now();
  const elapsed = Math.floor((now - startTimestamp) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} elapsed`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')} elapsed`;
};

const DiscordActivityModal = ({ open, onOpenChange, username, activities = [] }: DiscordActivityModalProps) => {
  // Filter out custom status
  const visibleActivities = activities.filter(a => a.type !== 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-ggsans bg-[#1e1f22] border-none rounded-2xl max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="w-14 h-14 rounded-xl bg-[#5865F2] flex items-center justify-center flex-shrink-0">
            <FaDiscord className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white">Discord Activities - {username}</h2>
            <p className="text-sm text-white/50 mt-1">All active Activities of this user.</p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activities */}
        <div className="px-6 pb-6 space-y-4">
          {visibleActivities.length > 0 ? (
            visibleActivities.map((activity, index) => {
              const largeImage = getAssetUrl(activity.application_id, activity.assets?.large_image);
              const smallImage = getAssetUrl(activity.application_id, activity.assets?.small_image);
              
              return (
                <div key={index} className="flex gap-3 p-3 rounded-xl bg-white/5">
                  {/* Activity image */}
                  <div className="relative flex-shrink-0">
                    {largeImage ? (
                      <img 
                        src={largeImage} 
                        alt={activity.assets?.large_text || activity.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                        <FaDiscord className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                    {smallImage && (
                      <img 
                        src={smallImage}
                        alt={activity.assets?.small_text || ""}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#1e1f22]"
                      />
                    )}
                  </div>
                  
                  {/* Activity info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50 uppercase font-medium">
                      {getActivityTypeLabel(activity.type)}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">{activity.name}</p>
                    {activity.details && (
                      <p className="text-xs text-white/70 truncate">{activity.details}</p>
                    )}
                    {activity.state && (
                      <p className="text-xs text-white/50 truncate">{activity.state}</p>
                    )}
                    {activity.timestamps?.start && (
                      <p className="text-xs text-white/40 mt-1">
                        {formatElapsedTime(activity.timestamps.start)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FaDiscord className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/80 font-medium">No Activities available</p>
              <p className="text-sm text-white/40 mt-1 max-w-[280px]">
                This user need to have at least one visible Activity to see it here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscordActivityModal;
