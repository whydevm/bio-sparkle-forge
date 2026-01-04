import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { X, Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface Report {
  id: string;
  reporter_id: string;
  reported_profile_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_username?: string;
  reported_username?: string;
}

const Admin = () => {
  const [profile, setProfile] = useState<any>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("badges");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin-login");
      return;
    }

    setAdminUserId(user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      toast.error("Could not verify admin access");
      navigate("/dashboard");
      return;
    }

    if (roleData) {
      setIsAdmin(true);
      loadBadges();
      loadReports();
    } else {
      toast.error("Access denied");
      navigate("/dashboard");
      return;
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

  const loadReports = async () => {
    const { data: reportsData } = await supabase
      .from("profile_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (reportsData) {
      // Get reporter and reported usernames
      const reporterIds = [...new Set(reportsData.map(r => r.reporter_id))];
      const profileIds = [...new Set(reportsData.map(r => r.reported_profile_id))];

      const { data: reporterProfiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", reporterIds);

      const { data: reportedProfiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", profileIds);

      const reporterMap = new Map(reporterProfiles?.map(p => [p.user_id, p.username]) || []);
      const reportedMap = new Map(reportedProfiles?.map(p => [p.id, p.username]) || []);

      setReports(reportsData.map(r => ({
        ...r,
        reporter_username: reporterMap.get(r.reporter_id) || "Unknown",
        reported_username: reportedMap.get(r.reported_profile_id) || "Unknown"
      })));
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("profile_reports")
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: adminUserId })
        .eq("id", reportId);

      if (error) throw error;
      toast.success("Report status updated");
      loadReports();
    } catch (error: any) {
      toast.error(error.message);
    }
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
          granted_by: adminUserId,
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
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.filter(r => r.status === 'pending').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Profile Reports
              </h3>
              
              {reports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reports found</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-accent/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">REPORTED BY:</span>{" "}
                            <span className="text-primary">/{report.reporter_username}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">WHO THEY REPORTED:</span>{" "}
                            <span className="text-primary">/{report.reported_username}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">REASON:</span>{" "}
                            <span className="font-medium">{report.reason}</span>
                          </div>
                          {report.description && (
                            <div className="text-sm text-muted-foreground mt-2">
                              {report.description}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          report.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                          report.status === 'dismissed' ? 'bg-red-500/20 text-red-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {report.status}
                        </span>
                        {report.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateReportStatus(report.id, 'resolved')}>
                              Resolve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateReportStatus(report.id, 'dismissed')}>
                              Dismiss
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
