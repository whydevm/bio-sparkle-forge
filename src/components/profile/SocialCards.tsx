import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  FaDiscord, FaTwitter, FaYoutube, FaTwitch, FaSpotify,
  FaInstagram, FaTiktok, FaGithub, FaSteam, FaUsers
} from "react-icons/fa";
import { HiPhotograph } from "react-icons/hi";
import { SiRoblox } from "react-icons/si";
import DiscordPresence from "./DiscordPresence";
import SpotifyPresence from "./SpotifyPresence";
import TikTokPresence from "./TikTokPresence";

interface SocialCard {
  id: string;
  platform: string;
  identifier: string;
  display_name?: string;
  avatar_url?: string;
  follower_count?: number;
  extra_data?: {
    content_type?: string;
    post_count?: number;
    verified?: boolean;
    [key: string]: any;
  };
}

interface SocialCardsProps {
  profileId: string;
  theme?: string;
}

const PLATFORMS: Record<string, { icon: any; color: string; name: string }> = {
  discord: { icon: FaDiscord, color: "#5865F2", name: "Discord" },
  twitter: { icon: FaTwitter, color: "#1DA1F2", name: "Twitter" },
  youtube: { icon: FaYoutube, color: "#FF0000", name: "YouTube" },
  twitch: { icon: FaTwitch, color: "#9146FF", name: "Twitch" },
  spotify: { icon: FaSpotify, color: "#1DB954", name: "Spotify" },
  instagram: { icon: FaInstagram, color: "#E4405F", name: "Instagram" },
  tiktok: { icon: FaTiktok, color: "#000000", name: "TikTok" },
  github: { icon: FaGithub, color: "#181717", name: "GitHub" },
  steam: { icon: FaSteam, color: "#000000", name: "Steam" },
  roblox: { icon: SiRoblox, color: "#E2231A", name: "Roblox" },
};

const SocialCards = ({ profileId, theme }: SocialCardsProps) => {
  const [cards, setCards] = useState<SocialCard[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("social_cards")
          .select("*")
          .eq("profile_id", profileId)
          .order("order_index");
        
        if (fetchError) {
          console.error("Error loading social cards:", fetchError);
          setCards([]);
        } else {
          setCards((data as SocialCard[]) || []);
        }
      } catch (err) {
        console.error("Error loading social cards:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [profileId]);

  // Don't render if loading
  if (loading) return null;
  if (cards.length === 0) return null;

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-700 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      {cards.map((card, index) => {
        const platform = PLATFORMS[card.platform];
        if (!platform) return null;

        const contentType = card.extra_data?.content_type;

        // Discord Rich Presence
        if (card.platform === "discord" && contentType === "presence") {
          return (
            <div
              key={card.id}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                animation: isVisible ? `fade-in 0.5s ease-out ${index * 0.1}s both` : undefined
              }}
            >
              <DiscordPresence userId={card.identifier} />
            </div>
          );
        }

        // Spotify Rich Presence (if user ID provided for Lanyard)
        if (card.platform === "spotify" && contentType === "presence") {
          return (
            <div
              key={card.id}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                animation: isVisible ? `fade-in 0.5s ease-out ${index * 0.1}s both` : undefined
              }}
            >
              <SpotifyPresence userId={card.identifier} />
            </div>
          );
        }

        // TikTok Presence
        if (card.platform === "tiktok" && contentType === "presence") {
          return (
            <div
              key={card.id}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                animation: isVisible ? `fade-in 0.5s ease-out ${index * 0.1}s both` : undefined
              }}
            >
              <TikTokPresence username={card.identifier} />
            </div>
          );
        }

        const Icon = platform.icon;
        const isVerified = card.extra_data?.verified;
        const postCount = card.extra_data?.post_count;

        return (
          <div
            key={card.id}
            className="flex items-center gap-3 p-4 rounded-xl border border-foreground/10 bg-background/20 backdrop-blur-md hover:border-foreground/20 transition-all duration-300"
            style={{ 
              transitionDelay: `${index * 100}ms`,
              animation: isVisible ? `fade-in 0.5s ease-out ${index * 0.1}s both` : undefined
            }}
          >
            {/* Avatar/Icon */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: platform.color }}
            >
              {card.avatar_url ? (
                <img 
                  src={card.avatar_url} 
                  alt={card.display_name || card.identifier}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Icon className="w-6 h-6 text-white" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground truncate">
                  {card.display_name || card.identifier}
                </span>
                {isVerified && (
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                )}
              </div>
              
              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs text-foreground/60 mt-0.5">
                {card.follower_count !== undefined && card.follower_count > 0 && (
                  <span className="flex items-center gap-1">
                    <FaUsers className="w-3 h-3" />
                    {formatFollowerCount(card.follower_count)} Followers
                  </span>
                )}
                {postCount !== undefined && postCount > 0 && (
                  <span className="flex items-center gap-1">
                    <HiPhotograph className="w-3 h-3" />
                    {formatFollowerCount(postCount)}
                  </span>
                )}
              </div>
            </div>

            {/* Platform indicator */}
            <div className="text-xs text-foreground/40 flex items-center gap-1 flex-shrink-0">
              <Icon className="w-3.5 h-3.5" style={{ color: platform.color }} />
              {platform.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SocialCards;