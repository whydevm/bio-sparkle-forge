import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";

interface DiscordPresenceProps {
  userId: string;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  display_name?: string;
}

interface DiscordPresenceData {
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities?: Array<{
    name: string;
    type: number;
    state?: string;
    details?: string;
  }>;
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

const DiscordPresence = ({ userId }: DiscordPresenceProps) => {
  const [presence, setPresence] = useState<DiscordPresenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPresence = async () => {
      if (!userId) {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/20 backdrop-blur-sm animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="w-20 h-3 bg-muted rounded" />
          <div className="w-16 h-2 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !presence) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/20 backdrop-blur-sm">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#5865F2" }}
        >
          <FaDiscord className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Discord</p>
          <p className="text-xs text-foreground/60">User ID: {userId}</p>
        </div>
      </div>
    );
  }

  const avatarUrl = presence.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.${presence.discord_user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(presence.discord_user.discriminator) % 5}.png`;

  const currentActivity = presence.activities?.find(a => a.type === 0);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/20 backdrop-blur-sm hover:border-foreground/40 transition-all duration-300">
      <div className="relative">
        <img
          src={avatarUrl}
          alt={presence.discord_user.username}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background"
          style={{ backgroundColor: statusColors[presence.discord_status] }}
          title={statusLabels[presence.discord_status]}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {presence.discord_user.display_name || presence.discord_user.username}
        </p>
        <p className="text-xs text-foreground/60 truncate">
          {currentActivity ? (
            <>Playing {currentActivity.name}</>
          ) : (
            statusLabels[presence.discord_status]
          )}
        </p>
        {currentActivity?.details && (
          <p className="text-xs text-foreground/40 truncate">{currentActivity.details}</p>
        )}
      </div>
    </div>
  );
};

export default DiscordPresence;
