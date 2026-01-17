import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { ExternalLink } from "lucide-react";

interface DiscordPresenceProps {
  userId: string;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  display_name?: string;
  public_flags?: number;
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
  activities?: Array<{
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
  }>;
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

// Discord badge asset URLs from Discord CDN
const DISCORD_BADGE_ASSETS: Record<number, { name: string; asset: string }> = {
  1: { name: "Discord Employee", asset: "5e74e9b61934fc1f67c65515d1f7e60d" },
  2: { name: "Partnered Server Owner", asset: "3f9748e53446a137a052f3454e2de41e" },
  4: { name: "HypeSquad Events", asset: "bf01d1073931f921909045f3a39fd264" },
  8: { name: "Bug Hunter Level 1", asset: "2717692c7dca7289b35297368a940dd0" },
  64: { name: "HypeSquad Bravery", asset: "8a88d63823d8a71cd5e390baa45efa02" },
  128: { name: "HypeSquad Brilliance", asset: "011940fd013da3f7fb926e4a1cd2e618" },
  256: { name: "HypeSquad Balance", asset: "3aa41de486fa12454c3761e8e223442e" },
  512: { name: "Early Supporter", asset: "7060786766c9c840eb3019e725d2b358" },
  16384: { name: "Bug Hunter Level 2", asset: "848f79194d4be5ff5f81505cbd0ce1e6" },
  131072: { name: "Verified Bot Developer", asset: "6df5892e0f35b051f8b61eace34d4571" },
  262144: { name: "Discord Certified Moderator", asset: "fee1624003e2fee35cb398e125dc479b" },
  4194304: { name: "Active Developer", asset: "6bdc42827a38498929a4920da12695d9" },
  1048576: { name: "Nitro", asset: "2ba85e8026a8614b640c2837bcdfe21b" },
};

// Premium type badges
const PREMIUM_BADGES: Record<number, { name: string; asset: string }> = {
  1: { name: "Nitro Classic", asset: "2ba85e8026a8614b640c2837bcdfe21b" },
  2: { name: "Nitro", asset: "2ba85e8026a8614b640c2837bcdfe21b" },
  3: { name: "Nitro Basic", asset: "2ba85e8026a8614b640c2837bcdfe21b" },
};

const DiscordPresence = ({ userId }: DiscordPresenceProps) => {
  const [presence, setPresence] = useState<DiscordPresenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresence = async () => {
      if (!userId) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        // Using Lanyard API for Discord presence
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch Discord presence");
        }
        const data = await response.json();
        if (data.success) {
          setPresence(data.data);
          setError(false);
          
          // Calculate last seen if offline
          if (data.data.discord_status === "offline") {
            setLastSeen("Offline");
          } else {
            setLastSeen(null);
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
    // Refresh every 30 seconds
    const interval = setInterval(fetchPresence, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Get badges from public_flags
  const getBadges = (flags?: number): { name: string; asset: string }[] => {
    if (!flags) return [];
    const badges: { name: string; asset: string }[] = [];
    
    for (const [bit, badge] of Object.entries(DISCORD_BADGE_ASSETS)) {
      if (flags & parseInt(bit)) {
        badges.push(badge);
      }
    }
    return badges;
  };

  // Get device indicator
  const getDevice = () => {
    if (!presence) return null;
    if (presence.active_on_discord_desktop) return "Desktop";
    if (presence.active_on_discord_mobile) return "Mobile";
    if (presence.active_on_discord_web) return "Web";
    return null;
  };

  // Get current activity
  const getCurrentActivity = () => {
    if (!presence?.activities) return null;
    const activity = presence.activities.find(a => a.type !== 4); // Skip custom status
    if (!activity) return null;
    
    let text = activity.name;
    if (activity.details) text += ` - ${activity.details}`;
    if (activity.state) text += ` (${activity.state})`;
    return text;
  };

  // Get avatar decoration URL
  const getAvatarDecorationUrl = () => {
    if (!presence?.discord_user?.avatar_decoration_data?.asset) return null;
    const asset = presence.discord_user.avatar_decoration_data.asset;
    // Avatar decorations are animated PNGs or APNGs
    return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160&passthrough=true`;
  };

  // Get clan badge URL
  const getClanBadgeUrl = () => {
    if (!presence?.discord_user?.clan?.badge) return null;
    const { identity_guild_id, badge } = presence.discord_user.clan;
    return `https://cdn.discordapp.com/clan-badges/${identity_guild_id}/${badge}.png?size=32`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md animate-pulse min-w-[280px]">
        <div className="w-14 h-14 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="w-24 h-4 bg-muted rounded" />
          <div className="w-20 h-3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !presence) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md min-w-[280px]">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#5865F2" }}
        >
          <FaDiscord className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Discord</p>
          <p className="text-xs text-foreground/60">User not on Lanyard</p>
          <p className="text-xs text-foreground/40">ID: {userId}</p>
        </div>
      </div>
    );
  }

  const avatarUrl = presence.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.${presence.discord_user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(presence.discord_user.discriminator || "0") % 5}.png`;

  const badges = getBadges(presence.discord_user.public_flags);
  const displayName = presence.discord_user.display_name || presence.discord_user.username;
  const device = getDevice();
  const activity = getCurrentActivity();
  const avatarDecorationUrl = getAvatarDecorationUrl();
  const clanBadgeUrl = getClanBadgeUrl();
  const clan = presence.discord_user.clan;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md hover:border-foreground/40 transition-all duration-300 min-w-[280px]">
      {/* Avatar with decoration and status indicator */}
      <div className="relative flex-shrink-0 w-14 h-14">
        <img
          src={avatarUrl}
          alt={presence.discord_user.username}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/0.png`;
          }}
        />
        
        {/* Avatar Decoration Overlay */}
        {avatarDecorationUrl && (
          <img
            src={avatarDecorationUrl}
            alt="Avatar decoration"
            className="absolute inset-0 w-[140%] h-[140%] -top-[20%] -left-[20%] pointer-events-none"
            style={{ imageRendering: "auto" }}
          />
        )}
        
        {/* Status indicator with pulse animation for online */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background z-10 ${
            presence.discord_status === "online" ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: statusColors[presence.discord_status] }}
          title={statusLabels[presence.discord_status]}
        />
      </div>

      {/* User info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-sm truncate">
            {displayName}
          </span>
          
          {/* Clan/Guild Tag */}
          {clan && clan.identity_enabled && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/10">
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
              <span className="text-xs font-medium text-foreground/80">{clan.tag}</span>
            </div>
          )}
          
          {/* Discord Badges */}
          {badges.length > 0 && (
            <div className="flex items-center gap-1">
              {badges.slice(0, 5).map((badge, idx) => (
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
        
        {/* Status text with device indicator */}
        <div className="flex items-center gap-2">
          <span 
            className="text-xs truncate"
            style={{ color: statusColors[presence.discord_status] }}
          >
            {statusLabels[presence.discord_status]}
          </span>
          {device && presence.discord_status !== "offline" && (
            <span className="text-xs text-foreground/40">• {device}</span>
          )}
        </div>

        {/* Current activity */}
        {activity && (
          <p className="text-xs text-foreground/50 truncate max-w-[180px]">
            {activity}
          </p>
        )}
      </div>

      {/* View profile button */}
      <a
        href={`https://discord.com/users/${userId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-foreground/10"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default DiscordPresence;