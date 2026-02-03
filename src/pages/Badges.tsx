import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import BadgeColorEditor from "@/components/dashboard/BadgeColorEditor";
import { Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond, GripVertical, Palette } from "lucide-react";

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

const Badges = () => {
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorEditorOpen, setColorEditorOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showBadgesOnProfile, setShowBadgesOnProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      // Check if show_badges_on_profile exists, default to true
      setShowBadgesOnProfile((profileData as any).show_badges_on_profile ?? true);
    }

    // Load all badges
    const { data: badgesData } = await supabase
      .from("badges")
      .select("*")
      .order("badge_type");

    setBadges(badgesData || []);

    // Load user's badges
    if (user) {
      const { data: userBadgesData } = await supabase
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
        .eq("user_id", user.id);

      const badges = userBadgesData
        ?.map((ub: any) => ub.badges)
        .filter(Boolean) || [];
      setUserBadges(badges);
    }

    setLoading(false);
  };

  const handleEditColor = (badge: any) => {
    setSelectedBadge(badge);
    setColorEditorOpen(true);
  };

  const handleSaveBadgeColor = async (badgeId: string, color: string) => {
    try {
      const currentColors = profile?.badge_colors || {};
      const updatedColors = { ...currentColors, [badgeId]: color };

      const { error } = await supabase
        .from("profiles")
        .update({ badge_colors: updatedColors })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, badge_colors: updatedColors });
      toast.success("Badge color updated!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleBadgeVisibility = async (checked: boolean) => {
    try {
      // Use raw update since column may not be in types yet
      const { error } = await supabase
        .from("profiles")
        .update({ show_badges_on_profile: checked } as any)
        .eq("id", profile.id);

      if (error) throw error;

      setShowBadgesOnProfile(checked);
      setProfile({ ...profile, show_badges_on_profile: checked });
      toast.success(checked ? "Badges are now visible on your profile" : "Badges are now hidden from your profile");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getBadgeAction = (badgeType: string) => {
    const actions: Record<string, { label: string; enabled: boolean }> = {
      helper: { label: "Join Discord", enabled: true },
      premium: { label: "Purchase", enabled: true },
      verified: { label: "Unlock", enabled: true },
      donor: { label: "Donate", enabled: true },
      gifter: { label: "Gift", enabled: true },
      image_host: { label: "Purchase", enabled: true },
      domain_legend: { label: "Add Domain", enabled: true },
      server_booster: { label: "Boost", enabled: true },
      bug_hunter: { label: "Report", enabled: true },
      staff: { label: "", enabled: false },
      og: { label: "", enabled: false },
      easter_2025: { label: "", enabled: false },
      christmas_2024: { label: "", enabled: false },
      million: { label: "", enabled: false },
      winner: { label: "", enabled: false },
      second_place: { label: "", enabled: false },
      third_place: { label: "", enabled: false },
    };
    return actions[badgeType] || { label: "", enabled: false };
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout username={profile.username}>
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        {/* Badge Visibility Toggle */}
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Show Badges on Profile</div>
              <div className="text-sm text-muted-foreground">Display your badges next to your username</div>
            </div>
          </div>
          <Switch
            checked={showBadgesOnProfile}
            onCheckedChange={handleToggleBadgeVisibility}
          />
        </div>

        {/* My Badges Section */}
        {userBadges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">My Badges</h2>
              <span className="text-sm text-muted-foreground">({userBadges.length})</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Click on a badge to customize its color. Drag to reorder.
            </p>
            <div className="space-y-2">
              {userBadges.map((badge) => {
                const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
                const customColor = profile?.badge_colors?.[badge.id];
                return (
                  <div
                    key={badge.id}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div 
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ color: customColor || '#ffffff' }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: customColor || '#ffffff' }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-sm text-muted-foreground">{badge.description}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditColor(badge)}
                      className="text-primary hover:text-primary"
                    >
                      <Palette className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">All Badges</h1>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        </div>

        <div className="space-y-3">
          {badges.map((badge) => {
            const action = getBadgeAction(badge.badge_type);
            const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
            return (
              <div
                key={badge.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 flex items-center justify-center text-foreground">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-sm text-muted-foreground">{badge.description}</div>
                  </div>
                </div>
                {action.enabled && (
                  <Button variant="secondary" size="sm">
                    {action.label}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
            <h3 className="font-semibold">Custom Badges</h3>
            <div className="ml-auto px-2 py-1 bg-primary/20 text-primary text-xs rounded">New</div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Custom badges allow you to create your own badges with a unique icon and name. You can edit your custom badges by using edit credits.
          </p>
          
          <Button className="w-full">Purchase</Button>
          <Button variant="outline" className="w-full">Preview Custom Badge</Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
            <h3 className="font-semibold">Upgrade to Premium</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            With Premium you can reorder, recolor, and toggle each badge individually.
          </p>
          
          <Button className="w-full">Upgrade Now</Button>
        </div>
      </div>

      <BadgeColorEditor
        open={colorEditorOpen}
        onOpenChange={setColorEditorOpen}
        badge={selectedBadge}
        currentColor={selectedBadge ? profile?.badge_colors?.[selectedBadge.id] || "" : ""}
        onSave={handleSaveBadgeColor}
      />
    </DashboardLayout>
  );
};

export default Badges;
