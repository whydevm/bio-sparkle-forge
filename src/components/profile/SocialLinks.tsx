import { Button } from "@/components/ui/button";
import {
  SiTiktok,
  SiInstagram,
  SiX,
  SiDiscord,
  SiGithub,
  SiSnapchat,
  SiYoutube,
  SiTwitch,
  SiSpotify,
  SiRoblox,
  SiSoundcloud,
  SiTelegram,
  SiReddit,
  SiLinkedin,
  SiSteam,
} from "react-icons/si";

interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  custom_icon_url?: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  glow?: boolean;
  monochrome?: boolean;
}

const PLATFORM_CONFIG: Record<string, { icon: any; color: string; name: string }> = {
  tiktok: { icon: SiTiktok, color: "#000000", name: "TikTok" },
  instagram: { icon: SiInstagram, color: "#E4405F", name: "Instagram" },
  twitter: { icon: SiX, color: "#000000", name: "X" },
  discord: { icon: SiDiscord, color: "#5865F2", name: "Discord" },
  "discord-server": { icon: SiDiscord, color: "#5865F2", name: "Discord" },
  "discord-profile": { icon: SiDiscord, color: "#5865F2", name: "Discord" },
  "discord-bot": { icon: SiDiscord, color: "#5865F2", name: "Discord" },
  github: { icon: SiGithub, color: "#181717", name: "GitHub" },
  snapchat: { icon: SiSnapchat, color: "#FFFC00", name: "Snapchat" },
  youtube: { icon: SiYoutube, color: "#FF0000", name: "YouTube" },
  twitch: { icon: SiTwitch, color: "#9146FF", name: "Twitch" },
  spotify: { icon: SiSpotify, color: "#1DB954", name: "Spotify" },
  "spotify-track": { icon: SiSpotify, color: "#1DB954", name: "Spotify" },
  "spotify-album": { icon: SiSpotify, color: "#1DB954", name: "Spotify" },
  "spotify-playlist": { icon: SiSpotify, color: "#1DB954", name: "Spotify" },
  roblox: { icon: SiRoblox, color: "#E2231A", name: "Roblox" },
  "roblox-profile": { icon: SiRoblox, color: "#E2231A", name: "Roblox" },
  "roblox-group": { icon: SiRoblox, color: "#E2231A", name: "Roblox" },
  "roblox-game": { icon: SiRoblox, color: "#E2231A", name: "Roblox" },
  soundcloud: { icon: SiSoundcloud, color: "#FF5500", name: "SoundCloud" },
  telegram: { icon: SiTelegram, color: "#26A5E4", name: "Telegram" },
  reddit: { icon: SiReddit, color: "#FF4500", name: "Reddit" },
  linkedin: { icon: SiLinkedin, color: "#0A66C2", name: "LinkedIn" },
  steam: { icon: SiSteam, color: "#000000", name: "Steam" },
};

const SocialLinks = ({ links, glow, monochrome }: SocialLinksProps) => {
  // Filter out invalid links
  const validLinks = links.filter(link => link && link.id && link.platform);

  if (validLinks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {validLinks.map((link) => {
        const platformKey = link.platform?.toLowerCase() || "";
        const config = PLATFORM_CONFIG[platformKey];
        const IconComponent = config?.icon;
        const platformName = config?.name || link.label || link.platform || "Link";
        const platformColor = config?.color || "#888888";

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl border border-foreground/20 bg-background/30 backdrop-blur-sm hover:bg-foreground/10 hover:border-foreground/40 transition-all duration-300 group ${
              glow ? "shadow-[0_0_15px_hsl(var(--primary)/0.3)]" : ""
            }`}
          >
            {/* Platform Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: monochrome ? "hsl(var(--foreground)/0.2)" : platformColor }}
            >
              {link.custom_icon_url ? (
                <img
                  src={link.custom_icon_url}
                  alt=""
                  className={`w-6 h-6 object-contain ${monochrome ? "brightness-0 invert" : ""}`}
                />
              ) : IconComponent ? (
                <IconComponent className="w-6 h-6 text-white" />
              ) : (
                <div className="w-6 h-6 bg-white/30 rounded" />
              )}
            </div>

            {/* Link Details */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {link.label || platformName}
              </p>
              <p className="text-sm text-foreground/60 truncate">
                {platformName}
              </p>
            </div>

            {/* Platform Label */}
            <div className="flex items-center gap-2 text-foreground/60">
              {IconComponent && (
                <IconComponent 
                  className="w-4 h-4" 
                  style={{ color: monochrome ? undefined : platformColor }}
                />
              )}
              <span className="text-sm font-medium hidden sm:inline">{platformName}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
