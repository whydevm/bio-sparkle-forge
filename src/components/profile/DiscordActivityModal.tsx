import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaDiscord } from "react-icons/fa";
import { X } from "lucide-react";

interface Activity {
  name: string;
  type: number;
  state?: string;
  details?: string;
  emoji?: {
    id?: string;
    name: string;
    animated?: boolean;
  };
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

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  display_name?: string;
  public_flags?: number;
  premium_type?: number;
  avatar_decoration_data?: {
    asset: string;
    sku_id?: string;
  };
  clan?: {
    identity_guild_id: string;
    tag: string;
    badge: string;
    identity_enabled: boolean;
  };
}

interface DiscordPresenceData {
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities?: Activity[];
  spotify?: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps: {
      start: number;
      end: number;
    };
  };
  listening_to_spotify?: boolean;
}

interface DiscordActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presence: DiscordPresenceData;
}

const statusColors: Record<string, string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

const statusLabels: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

// Complete Discord badge flags
const DISCORD_BADGE_FLAGS: Record<number, { name: string; asset: string }> = {
  1: { name: "Discord Staff", asset: "5e74e9b61934fc1f67c65515d1f7e60d" },
  2: { name: "Partnered Server Owner", asset: "3f9748e53446a137a052f3454e2de41e" },
  4: { name: "HypeSquad Events", asset: "bf01d1073931f921909045f3a39fd264" },
  8: { name: "Bug Hunter Level 1", asset: "2717692c7dca7289b35297368a940dd0" },
  64: { name: "HypeSquad Bravery", asset: "8a88d63823d8a71cd5e390baa45efa02" },
  128: { name: "HypeSquad Brilliance", asset: "011940fd013da3f7fb926e4a1cd2e618" },
  256: { name: "HypeSquad Balance", asset: "3aa41de486fa12454c3761e8e223442e" },
  512: { name: "Early Supporter", asset: "7060786766c9c840eb3019e725d2b358" },
  16384: { name: "Bug Hunter Level 2", asset: "848f79194d4be5ff5f81505cbd0ce1e6" },
  131072: { name: "Early Verified Bot Developer", asset: "6df5892e0f35b051f8b61eace34d4571" },
  262144: { name: "Discord Certified Moderator", asset: "fee1624003e2fee35cb398e125dc479b" },
  4194304: { name: "Active Developer", asset: "6bdc42827a38498929a4920da12695d9" },
};

const NITRO_BADGE = { name: "Nitro", asset: "2ba85e8026a8614b640c2837bcdfe21b" };

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

const getBadges = (flags?: number, premiumType?: number): { name: string; asset: string }[] => {
  const badges: { name: string; asset: string }[] = [];
  
  if (flags) {
    for (const [bit, badge] of Object.entries(DISCORD_BADGE_FLAGS)) {
      if (flags & parseInt(bit)) {
        badges.push(badge);
      }
    }
  }
  
  if (premiumType && premiumType > 0) {
    badges.push(NITRO_BADGE);
  }
  
  return badges;
};

const DiscordActivityModal = ({ open, onOpenChange, presence }: DiscordActivityModalProps) => {
  const { discord_user, discord_status, activities = [] } = presence;
  
  // Filter out custom status for activities list
  const visibleActivities = activities.filter(a => a.type !== 4);
  const customStatus = activities.find(a => a.type === 4);
  
  const avatarUrl = discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${discord_user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator || "0") % 5}.png`;
  
  const displayName = discord_user.display_name || discord_user.username;
  const badges = getBadges(discord_user.public_flags, discord_user.premium_type);
  
  // Get avatar decoration URL
  const getAvatarDecorationUrl = () => {
    if (!discord_user.avatar_decoration_data?.asset) return null;
    const asset = discord_user.avatar_decoration_data.asset;
    return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160&passthrough=true`;
  };
  
  const avatarDecorationUrl = getAvatarDecorationUrl();
  
  // Get clan badge URL
  const getClanBadgeUrl = () => {
    if (!discord_user.clan?.badge) return null;
    const { identity_guild_id, badge } = discord_user.clan;
    return `https://cdn.discordapp.com/clan-badges/${identity_guild_id}/${badge}.png?size=32`;
  };
  
  const clanBadgeUrl = getClanBadgeUrl();
  const clan = discord_user.clan;

  // Get custom status emoji
  const getStatusEmoji = () => {
    if (!customStatus?.emoji) return null;
    if (customStatus.emoji.id) {
      const extension = customStatus.emoji.animated ? "gif" : "png";
      return `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${extension}?size=20`;
    }
    return customStatus.emoji.name;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-ggsans bg-[#111214] border border-white/10 rounded-2xl max-w-sm p-0 overflow-hidden">
        {/* Header with user info */}
        <div className="p-6 pb-4">
          {/* Avatar and Status */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
              <img
                src={avatarUrl}
                alt={discord_user.username}
                className="w-full h-full rounded-full object-cover"
              />
              
              {/* Avatar Decoration */}
              {avatarDecorationUrl && (
                <img
                  src={avatarDecorationUrl}
                  alt="Avatar decoration"
                  className="absolute pointer-events-none"
                  style={{
                    width: '140%',
                    height: '140%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
              
              {/* Status indicator */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-[#111214] z-10"
                style={{ backgroundColor: statusColors[discord_status] }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-white truncate">{displayName}</h2>
                
                {/* Clan/Guild Tag */}
                {clan && clan.identity_enabled && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10">
                    {clanBadgeUrl && (
                      <img
                        src={clanBadgeUrl}
                        alt={`${clan.tag} clan badge`}
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-xs font-medium text-white/80">{clan.tag}</span>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {badges.map((badge, idx) => (
                    <img
                      key={idx}
                      src={`https://cdn.discordapp.com/badge-icons/${badge.asset}.png`}
                      alt={badge.name}
                      title={badge.name}
                      className="w-5 h-5"
                    />
                  ))}
                </div>
              )}
              
              {/* Status */}
              <div className="flex items-center gap-2 mt-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[discord_status] }}
                />
                <span className="text-sm text-white/70">{statusLabels[discord_status]}</span>
              </div>
              
              {/* Custom status with emoji */}
              {customStatus && customStatus.state && (
                <div className="flex items-center gap-1.5 mt-1">
                  {customStatus.emoji && (
                    <>
                      {customStatus.emoji.id ? (
                        <img 
                          src={getStatusEmoji() || ""} 
                          alt="" 
                          className="w-4 h-4"
                        />
                      ) : (
                        <span className="text-sm">{customStatus.emoji.name}</span>
                      )}
                    </>
                  )}
                  <span className="text-sm text-white/60 truncate">{customStatus.state}</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => onOpenChange(false)}
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activities */}
        <div className="px-6 pb-6 space-y-3">
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
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#111214]"
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FaDiscord className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/80 font-medium">No Activities</p>
              <p className="text-sm text-white/40 mt-1 max-w-[240px]">
                This user doesn't have any visible activities
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscordActivityModal;
