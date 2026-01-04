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
}

interface AvatarDecoration {
  asset: string;
  sku_id?: string;
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

// Discord public flags badge mapping
const DISCORD_BADGES: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: "Discord Employee", icon: "👨‍💼", color: "#5865F2" },
  2: { name: "Partnered Server Owner", icon: "🤝", color: "#5865F2" },
  4: { name: "HypeSquad Events", icon: "🎉", color: "#f47b67" },
  8: { name: "Bug Hunter Level 1", icon: "🐛", color: "#3ba55c" },
  64: { name: "HypeSquad Bravery", icon: "🟣", color: "#9c84ef" },
  128: { name: "HypeSquad Brilliance", icon: "🟠", color: "#f47b67" },
  256: { name: "HypeSquad Balance", icon: "🟢", color: "#49ddc1" },
  512: { name: "Early Supporter", icon: "💎", color: "#7289da" },
  16384: { name: "Bug Hunter Level 2", icon: "🐛", color: "#f9a62b" },
  131072: { name: "Verified Bot Developer", icon: "🤖", color: "#5865F2" },
  262144: { name: "Discord Certified Moderator", icon: "🛡️", color: "#5865F2" },
  4194304: { name: "Active Developer", icon: "💻", color: "#23a559" },
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
  const getBadges = (flags?: number): { name: string; icon: string; color: string }[] => {
    if (!flags) return [];
    const badges: { name: string; icon: string; color: string }[] = [];
    
    for (const [bit, badge] of Object.entries(DISCORD_BADGES)) {
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md animate-pulse min-w-[280px]">
        <div className="w-12 h-12 rounded-full bg-muted" />
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
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#5865F2" }}
        >
          <FaDiscord className="w-6 h-6 text-white" />
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

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-md hover:border-foreground/40 transition-all duration-300 min-w-[280px]">
      {/* Avatar with status indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl}
          alt={presence.discord_user.username}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/0.png`;
          }}
        />
        {/* Status indicator with pulse animation for online */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${
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
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex items-center gap-1">
              {badges.slice(0, 4).map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs"
                  title={badge.name}
                  style={{ filter: `drop-shadow(0 0 2px ${badge.color})` }}
                >
                  {badge.icon}
                </span>
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