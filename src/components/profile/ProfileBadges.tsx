import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const ProfileBadges = ({ userId, badgeColors = {}, showBorder = true, badgeBorder }: ProfileBadgesProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex justify-center mt-2 mb-3">
      <div className="inline-flex items-center gap-2 bg-transparent border border-foreground/20 rounded-lg px-4 py-2">
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
              <TooltipContent className="bg-background/95 border-border">
                <p className="font-semibold">{badge.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileBadges;