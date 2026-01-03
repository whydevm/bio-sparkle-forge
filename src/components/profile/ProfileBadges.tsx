import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: string;
}

interface ProfileBadgesProps {
  userId: string;
}

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const ProfileBadges = ({ userId }: ProfileBadgesProps) => {
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
      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
        {badges.map((badge) => {
          const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
          return (
            <div
              key={badge.id}
              className="flex items-center justify-center"
              title={`${badge.name}: ${badge.description}`}
            >
              <IconComponent className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileBadges;