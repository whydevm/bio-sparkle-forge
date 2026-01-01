import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  FaDiscord, FaTwitter, FaYoutube, FaTwitch, FaSpotify,
  FaInstagram, FaTiktok, FaGithub, FaSteam
} from "react-icons/fa";
import { SiRoblox } from "react-icons/si";

interface SocialCard {
  id: string;
  platform: string;
  identifier: string;
  display_name?: string;
  avatar_url?: string;
  follower_count?: number;
  extra_data?: any;
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
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("social_cards")
          .select("*")
          .eq("profile_id", profileId)
          .order("order_index");
        
        if (fetchError) {
          console.error("Error loading social cards:", fetchError);
          setError(true);
          return;
        }
        setCards((data as SocialCard[]) || []);
      } catch (err) {
        console.error("Error loading social cards:", err);
        setError(true);
      }
    };
    
    if (profileId) {
      loadCards();
    }

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [profileId]);

  // Don't render if basic theme or no cards or error
  if (theme === "basic" || cards.length === 0 || error) return null;

  return (
    <div className={`flex flex-wrap gap-3 justify-center transition-all duration-700 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      {cards.map((card, index) => {
        const platform = PLATFORMS[card.platform];
        if (!platform) return null;
        const Icon = platform.icon;

        return (
          <div
            key={card.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-background/20 backdrop-blur-sm hover:border-foreground/40 transition-all duration-300"
            style={{ 
              transitionDelay: `${index * 100}ms`,
              animation: isVisible ? `fade-in 0.5s ease-out ${index * 0.1}s both` : undefined
            }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: platform.color }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{platform.name}</p>
              <p className="text-xs text-foreground/60 truncate max-w-[120px]">
                {card.display_name || card.identifier}
              </p>
              {card.follower_count !== undefined && (
                <p className="text-xs text-foreground/40">
                  {card.follower_count.toLocaleString()} followers
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SocialCards;
