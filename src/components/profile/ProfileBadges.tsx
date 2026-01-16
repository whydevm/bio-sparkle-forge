import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: string;
}

interface ProfileBadgesProps {
  userId: string;
  badgeColors?: Record<string, string>;
  showBorder?: boolean;
  badgeBorder?: boolean;
  inline?: boolean;
  globalRadius?: number;
}

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  owner: Crown,
  manager: Wrench,
  staff: Star,
  helper: Shield,
  og: Sparkles,
  verified: Check,
  premium: Zap,
  donor: Heart,
  gifter: Gift,
  bug_hunter: Bug,
  winner: Trophy,
  second_place: Medal,
  third_place: Medal,
  server_booster: Zap,
  million: Diamond,
  domain_legend: Shield,
  image_host: Shield,
  christmas_2024: Sparkles,
  easter_2025: Sparkles,
};

const ProfileBadges = ({ userId, badgeColors = {}, showBorder = true, badgeBorder, inline = false, globalRadius = 50 }: ProfileBadgesProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate border radius based on global setting
  const inlineBorderRadius = `${Math.round((globalRadius / 100) * 9999)}px`;
  const normalBorderRadius = `${Math.round((globalRadius / 100) * 12)}px`;

  useEffect(() => {
    if (userId) {
      loadBadges();
    }
  }, [userId]);

  const loadBadges = async () => {
    const { data } = await supabase
      .from("user_badges")
      .select(`
        badge_id,
        badges (
          id,
          name,
          description,
          icon,
          badge_type
        )
      `)
      .eq("user_id", userId);

    if (data) {
      const userBadges = data
        .map((ub: any) => ub.badges)
        .filter(Boolean) as Badge[];
      setBadges(userBadges);
    }
    setLoading(false);
  };

  if (loading || badges.length === 0) {
    return null;
  }

  // Inline mode: badges appear next to username with a pill container and border
  if (inline) {
    return (
      <TooltipProvider>
        <div 
          className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm border border-white/20 px-3 py-1.5"
          style={{ borderRadius: inlineBorderRadius }}
        >
          {badges.map((badge) => {
            const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
            const customColor = badgeColors[badge.id];
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <IconComponent 
                      className="w-4 h-4 drop-shadow-lg" 
                      style={{ color: customColor || '#ffffff' }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 backdrop-blur-sm border-0 px-3 py-1.5 rounded-2xl">
                  <p className="font-semibold text-xs text-white font-ggsans">{badge.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex justify-center mt-2 mb-3">
      <TooltipProvider>
        <div 
          className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/20 px-4 py-2"
          style={{ borderRadius: normalBorderRadius }}
        >
          {badges.map((badge) => {
            const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
            const customColor = badgeColors[badge.id];
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  >
                    <IconComponent 
                      className="w-5 h-5 drop-shadow-lg" 
                      style={{ color: customColor || '#ffffff' }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 backdrop-blur-sm border-0 px-3 py-1.5 rounded-2xl">
                  <p className="font-semibold text-white font-ggsans">{badge.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ProfileBadges;