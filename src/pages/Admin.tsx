import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X, Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond } from "lucide-react";

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

const Admin = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin-login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Check if user has admin role
    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleData && !error) {
      setIsAdmin(true);
      loadBadges();
    } else {
      toast.error("Access denied");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const loadBadges = async () => {
    const { data } = await supabase
      .from("badges")
      .select("*")
      .order("name");

    setBadges(data || []);
  };

  const searchUser = async () => {
    if (!usernameInput) {
      toast.error("Please enter a username");
      return;
    }

    // Extract username from URL if pasted
    const username = usernameInput.includes("/") 
      ? usernameInput.split("/").pop() 
      : usernameInput;
    
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (!targetProfile) {
      toast.error("User not found");
      setTargetUser(null);
      setUserBadges([]);
      return;
    }

    setTargetUser(targetProfile);
    
    // Load user's current badges
    const { data: userBadgesData } = await supabase
      .from("user_badges")
      .select(`
        id,
        badge_id,
        badges (
          id,
          name,
          description,
          icon,
          badge_type
        )
      `)
      .eq("user_id", targetProfile.user_id);

    setUserBadges(userBadgesData || []);
  };

  const handleGrantBadge = async () => {
    if (!targetUser || !selectedBadge) {
      toast.error("Please select a user and badge");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_badges")
        .insert({
          user_id: targetUser.user_id,
          badge_id: selectedBadge,
          granted_by: profile.user_id,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("User already has this badge");
        } else {
          throw error;
        }
      } else {
        toast.success("Badge granted successfully!");
        setSelectedBadge("");
        searchUser(); // Refresh user badges
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveBadge = async (userBadgeId: string) => {
    try {
      const { error } = await supabase
        .from("user_badges")
        .delete()
        .eq("id", userBadgeId);

      if (error) throw error;
      
      toast.success("Badge removed successfully!");
      searchUser(); // Refresh user badges
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout username={profile?.username}>
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* User Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="username-input">ACCOUNT USER</Label>
              <div className="flex gap-2">
                <Input
                  id="username-input"
                  placeholder="/username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUser()}
                />
                <Button onClick={searchUser}>Search</Button>
              </div>
            </div>

            {targetUser && (
              <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  {targetUser.avatar_url && (
                    <img 
                      src={targetUser.avatar_url} 
                      alt="" 
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{targetUser.display_name || targetUser.username}</p>
                    <p className="text-sm text-muted-foreground">@{targetUser.username}</p>
                  </div>
                </div>

                {/* Current Badges */}
                {userBadges.length > 0 && (
                  <div>
                    <Label className="mb-2 block">REMOVE BADGE</Label>
                    <div className="flex flex-wrap gap-2">
                      {userBadges.map((ub) => {
                        const badge = ub.badges;
                        if (!badge) return null;
                        const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
                        return (
                          <div
                            key={ub.id}
                            className="inline-flex items-center gap-2 bg-background border border-border rounded-full px-3 py-1.5"
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm">{badge.name}</span>
                            <button
                              onClick={() => handleRemoveBadge(ub.id)}
                              className="ml-1 hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add Badge */}
                <div>
                  <Label htmlFor="badge-select">ADD BADGE</Label>
                  <div className="flex gap-2">
                    <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                      <SelectTrigger id="badge-select" className="flex-1">
                        <SelectValue placeholder="Choose a badge..." />
                      </SelectTrigger>
                      <SelectContent>
                        {badges.map((badge) => {
                          const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
                          const alreadyHas = userBadges.some(ub => ub.badge_id === badge.id);
                          return (
                            <SelectItem 
                              key={badge.id} 
                              value={badge.id}
                              disabled={alreadyHas}
                            >
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                <span>{badge.name}</span>
                                {alreadyHas && <span className="text-xs text-muted-foreground">(owned)</span>}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleGrantBadge}>Grant</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-3">Available Badges</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {badges.map((badge) => {
                const IconComponent = BADGE_ICONS[badge.badge_type] || Star;
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 p-2 bg-accent rounded-lg text-sm"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
