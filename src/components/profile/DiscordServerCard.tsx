import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";

interface DiscordServerCardProps {
  inviteCode: string;
  globalRadius?: number;
}

interface ServerData {
  guild: {
    id: string;
    name: string;
    icon?: string;
    splash?: string;
    banner?: string;
    description?: string;
    features: string[];
  };
  approximate_member_count: number;
  approximate_presence_count: number;
}

const DiscordServerCard = ({ inviteCode, globalRadius = 50 }: DiscordServerCardProps) => {
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  // Extract invite code from URL if full URL is provided
  const extractInviteCode = (input: string): string => {
    if (input.includes("discord.gg/")) {
      return input.split("discord.gg/")[1].split("/")[0].split("?")[0];
    }
    if (input.includes("discord.com/invite/")) {
      return input.split("discord.com/invite/")[1].split("/")[0].split("?")[0];
    }
    return input;
  };

  useEffect(() => {
    const fetchServerData = async () => {
      const code = extractInviteCode(inviteCode);
      if (!code) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const response = await fetch(
          `https://discord.com/api/v10/invites/${code}?with_counts=true`
        );
        if (!response.ok) throw new Error("Failed to fetch server data");
        
        const data = await response.json();
        setServerData(data);
        setError(false);
      } catch (err) {
        console.error("Discord server fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServerData();
  }, [inviteCode]);

  const formatMemberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div 
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm animate-pulse"
        style={{ borderRadius }}
      >
        <div className="w-14 h-14 rounded-xl bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="w-24 h-4 bg-white/10 rounded" />
          <div className="w-32 h-3 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !serverData) {
    return (
      <div 
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm"
        style={{ borderRadius }}
      >
        <div className="w-14 h-14 rounded-xl bg-[#5865F2] flex items-center justify-center">
          <FaDiscord className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Discord Server</p>
          <p className="text-xs text-white/50">Invalid invite link</p>
        </div>
      </div>
    );
  }

  const iconUrl = serverData.guild.icon
    ? `https://cdn.discordapp.com/icons/${serverData.guild.id}/${serverData.guild.icon}.${serverData.guild.icon.startsWith("a_") ? "gif" : "png"}?size=128`
    : null;

  const handleJoin = () => {
    const code = extractInviteCode(inviteCode);
    window.open(`https://discord.gg/${code}`, "_blank");
  };

  return (
    <div 
      className="font-ggsans relative flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
      style={{ borderRadius }}
    >
      {/* Server Icon */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={serverData.guild.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#5865F2] flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {serverData.guild.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Server Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm truncate">
            {serverData.guild.name}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-white/70 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#23a55a]" />
            {formatMemberCount(serverData.approximate_presence_count)} Online
          </span>
          <span className="text-xs text-white/50 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/30" />
            {formatMemberCount(serverData.approximate_member_count)} Members
          </span>
        </div>
      </div>

      {/* Join Button */}
      <button
        onClick={handleJoin}
        className="px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-colors flex-shrink-0"
      >
        Join
      </button>

      {/* Discord Label */}
      <div className="absolute top-3 right-3 flex items-center gap-1 text-white/50">
        <FaDiscord className="w-4 h-4 text-[#5865F2]" />
        <span className="text-xs">Discord</span>
      </div>
    </div>
  );
};

export default DiscordServerCard;
