import { useEffect, useState } from "react";
import DiscordActivityModal from "./DiscordActivityModal";
import DiscordStatusIcon from "./DiscordStatusIcon";
import { FaSpotify } from "react-icons/fa";

interface DiscordPresenceProps {
  userId: string;
  globalRadius?: number;
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
  primary_guild?: {
    identity_guild_id: string;
    tag: string;
    badge: string;
    identity_enabled: boolean;
  };
}

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
  active_on_discord_desktop?: boolean;
  active_on_discord_mobile?: boolean;
  active_on_discord_web?: boolean;
  kv?: Record<string, string>;
}

// Complete Discord badge flags - ALL known badges from public_flags
const DISCORD_BADGE_FLAGS: Record<number, { name: string; asset: string }> = {
  1: { name: "Discord Staff", asset: "5e74e9b61934fc1f67c65515d1f7e60d" },
  2: { name: "Partnered Server Owner", asset: "3f9748e53446a137a052f3454e2de41e" },
  4: { name: "HypeSquad Events", asset: "bf01d1073931f921909045f3a39fd264" },
  8: { name: "Bug Hunter Level 1", asset: "2717692c7dca7289b35297368a940dd0" },
  64: { name: "HypeSquad Bravery", asset: "8a88d63823d8a71cd5e390baa45efa02" },
  128: { name: "HypeSquad Brilliance", asset: "011940fd013da3f7fb926e4a1cd2e018" },
  256: { name: "HypeSquad Balance", asset: "3aa41de486fa12454c3761e8e223442e" },
  512: { name: "Early Supporter", asset: "7060786766c9c840eb3019e725d2b358" },
  16384: { name: "Bug Hunter Level 2", asset: "848f79194d4be5ff5f81505cbd0ce1e6" },
  131072: { name: "Early Verified Bot Developer", asset: "6df5892e0f35b051f8b61eace34d4571" },
  262144: { name: "Discord Certified Moderator", asset: "fee1624003e2fee35cb398e125dc479b" },
  4194304: { name: "Active Developer", asset: "6bdc42827a38498929a4920da12695d9" },
};

// Nitro badges by premium_type
const NITRO_BADGES: Record<number, { name: string; asset: string }> = {
  1: { name: "Nitro Classic", asset: "2ba85e8026a8614b640c2837bcdfe21b" },
  2: { name: "Nitro", asset: "2ba85e8026a8614b640c2837bcdfe21b" },
  3: { name: "Nitro Basic", asset: "d99c59263c6576c94b0c520acc707796" },
};

// Special badges from Lanyard KV or decoration detection
const SPECIAL_BADGES: Record<string, { name: string; asset: string }> = {
  quest: { name: "Completed a Quest", asset: "7d9ae358c8c5e118768335dbe68b4fb8" },
  legacy_username: { name: "Originally Known As", asset: "6de6d34650760ba5551a79732e98ed60" },
};

const DiscordPresence = ({ userId, globalRadius = 50 }: DiscordPresenceProps) => {
  const [presence, setPresence] = useState<DiscordPresenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSeenText, setLastSeenText] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  useEffect(() => {
    const fetchPresence = async () => {
      if (!userId) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch Discord presence");
        
        const data = await response.json();
        if (data.success) {
          setPresence(data.data);
          setError(false);
          
          // Calculate last seen from KV store if offline
          if (data.data.discord_status === "offline") {
            const lastOnline = data.data.kv?.last_online;
            if (lastOnline) {
              const lastOnlineDate = new Date(parseInt(lastOnline));
              const now = new Date();
              const diffMs = now.getTime() - lastOnlineDate.getTime();
              const diffMins = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              
              if (diffDays > 0) {
                setLastSeenText(`Last seen ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`);
              } else if (diffHours > 0) {
                setLastSeenText(`Last seen ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`);
              } else if (diffMins > 0) {
                setLastSeenText(`Last seen ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`);
              } else {
                setLastSeenText("Last seen just now");
              }
            } else {
              setLastSeenText(null);
            }
          } else {
            setLastSeenText(null);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Discord presence error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Get badges from public_flags, premium_type, and KV store
  const getBadges = (
    flags?: number, 
    premiumType?: number,
    kv?: Record<string, string>
  ): { name: string; asset: string }[] => {
    const badges: { name: string; asset: string }[] = [];
    
    // Parse public_flags for standard badges
    if (flags) {
      for (const [bit, badge] of Object.entries(DISCORD_BADGE_FLAGS)) {
        if (flags & parseInt(bit)) {
          badges.push(badge);
        }
      }
    }
    
    // Add Nitro badge if premium
    if (premiumType && premiumType > 0 && NITRO_BADGES[premiumType]) {
      badges.push(NITRO_BADGES[premiumType]);
    }
    
    // Check KV store for additional badges
    if (kv) {
      if (kv.quest_completed === "true") {
        badges.push(SPECIAL_BADGES.quest);
      }
      if (kv.legacy_username) {
        badges.push(SPECIAL_BADGES.legacy_username);
      }
    }
    
    return badges;
  };

  // Get avatar decoration URL
  const getAvatarDecorationUrl = () => {
    if (!presence?.discord_user?.avatar_decoration_data?.asset) return null;
    const asset = presence.discord_user.avatar_decoration_data.asset;
    const isAnimated = asset.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.${extension}?size=160&passthrough=true`;
  };

  // Get clan badge URL
  const getClanBadgeUrl = () => {
    if (!presence?.discord_user?.clan?.badge) return null;
    const { identity_guild_id, badge } = presence.discord_user.clan;
    return `https://cdn.discordapp.com/clan-badges/${identity_guild_id}/${badge}.png?size=32`;
  };

  // Get custom status from activities
  const getCustomStatus = () => {
    if (!presence?.activities) return null;
    const customStatus = presence.activities.find(a => a.type === 4);
    return customStatus;
  };

  // Get custom status emoji
  const getStatusEmoji = (activity: Activity) => {
    if (!activity.emoji) return null;
    if (activity.emoji.id) {
      const extension = activity.emoji.animated ? "gif" : "png";
      return `https://cdn.discordapp.com/emojis/${activity.emoji.id}.${extension}?size=20`;
    }
    return activity.emoji.name;
  };

  if (loading) {
    return (
      <div 
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm animate-pulse"
        style={{ borderRadius }}
      >
        <div className="w-14 h-14 rounded-full bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="w-24 h-4 bg-white/10 rounded" />
          <div className="w-20 h-3 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !presence) {
    return (
      <div 
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm"
        style={{ borderRadius }}
      >
        <div className="w-14 h-14 rounded-full bg-[#5865F2] flex items-center justify-center">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Discord</p>
          <p className="text-xs text-white/50">Join discord.gg/lanyard</p>
        </div>
      </div>
    );
  }

  const avatarUrl = presence.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.${presence.discord_user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(presence.discord_user.discriminator || "0") % 5}.png`;

  const badges = getBadges(presence.discord_user.public_flags, presence.discord_user.premium_type, presence.kv);
  const displayName = presence.discord_user.display_name || presence.discord_user.username;
  const avatarDecorationUrl = getAvatarDecorationUrl();
  const clanBadgeUrl = getClanBadgeUrl();
  const clan = presence.discord_user.clan;
  const customStatus = getCustomStatus();
  const isListeningToSpotify = presence.listening_to_spotify && presence.spotify;

  return (
    <>
      <div 
        onClick={() => setShowActivityModal(true)}
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer"
        style={{ borderRadius }}
      >
        {/* Avatar with decoration and status indicator */}
        <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
          {/* Avatar circle */}
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <img
              src={avatarUrl}
              alt={presence.discord_user.username}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/0.png`;
              }}
            />
          </div>
          
          {/* Avatar Decoration Overlay */}
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
                imageRendering: 'auto',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          {/* Status indicator - Real Discord icon */}
          <div className="absolute -bottom-0.5 -right-0.5 z-10">
            <DiscordStatusIcon status={presence.discord_status} size={20} />
          </div>
        </div>

        {/* User info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm truncate">
              {displayName}
            </span>
            
            {/* Clan/Guild Tag */}
            {clan && clan.identity_enabled && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10">
                {clanBadgeUrl && (
                  <img
                    src={clanBadgeUrl}
                    alt={`${clan.tag} clan badge`}
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-xs font-medium text-white/80">{clan.tag}</span>
              </div>
            )}
            
            {/* Discord Badges */}
            {badges.length > 0 && (
              <div className="flex items-center gap-1">
                {badges.map((badge, idx) => (
                  <img
                    key={idx}
                    src={`https://cdn.discordapp.com/badge-icons/${badge.asset}.png`}
                    alt={badge.name}
                    title={badge.name}
                    className="w-5 h-5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Spotify listening - shows when listening to Spotify */}
          {isListeningToSpotify && presence.spotify && (
            <div className="flex items-center gap-2 mt-1">
              <img 
                src={presence.spotify.album_art_url} 
                alt={presence.spotify.album}
                className="w-8 h-8 rounded"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <FaSpotify className="w-3 h-3 text-[#1DB954] flex-shrink-0" />
                  <span className="text-xs text-white/90 truncate font-medium">{presence.spotify.song}</span>
                </div>
                <span className="text-xs text-white/50 truncate block">by {presence.spotify.artist}</span>
              </div>
            </div>
          )}
          
          {/* Custom status with emoji - only when not listening to Spotify */}
          {!isListeningToSpotify && customStatus && customStatus.state && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {customStatus.emoji && (
                <>
                  {customStatus.emoji.id ? (
                    <img 
                      src={getStatusEmoji(customStatus) || ""} 
                      alt="" 
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className="text-sm">{customStatus.emoji.name}</span>
                  )}
                </>
              )}
              <span className="text-xs text-white/70 truncate">{customStatus.state}</span>
            </div>
          )}
          
          {/* Last seen for offline users */}
          {!isListeningToSpotify && presence.discord_status === "offline" && lastSeenText && !customStatus?.state && (
            <span className="text-xs text-white/50">
              {lastSeenText}
            </span>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      <DiscordActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        presence={presence}
      />
    </>
  );
};

export default DiscordPresence;
