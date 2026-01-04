import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Check, AlertCircle, ChevronRight, Globe, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiTiktok, SiInstagram, SiDiscord, SiGithub, SiYoutube, SiX } from "react-icons/si";

const Overview = () => {
  const [profile, setProfile] = useState<any>(null);
  const [hasSocialLinks, setHasSocialLinks] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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
      
      // Check if user has social links
      const { count } = await supabase
        .from("social_links")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileData.id);
      
      setHasSocialLinks((count || 0) > 0);
    }
    setLoading(false);
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  const completionItems = [
    { label: "Upload An Avatar", completed: !!profile.avatar_url, route: "/dashboard" },
    { label: "Add A Description", completed: !!profile.bio, route: "/dashboard" },
    { label: "Add Socials", completed: hasSocialLinks, route: "/links" },
    { label: "Enable 2FA", completed: false, route: "/account/settings" },
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);
  const isComplete = completionPercentage === 100;

  return (
    <DashboardLayout username={profile.username}>
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Account Overview</h1>

        {/* General Information */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Username</div>
              <div className="font-medium">{profile.username}</div>
              <div className="text-xs text-muted-foreground">Change available now</div>
            </div>
            <button className="p-2 hover:bg-accent rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Alias</div>
              <div className="font-medium">Unavailable</div>
              <div className="text-xs text-primary">Premium Only</div>
            </div>
            <button className="p-2 hover:bg-accent rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">UID</div>
              <div className="font-medium font-mono">1,128,964</div>
              <div className="text-xs text-muted-foreground">Joined after 1000's of users</div>
            </div>
            <div className="p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Profile Views</div>
              <div className="font-medium">{profile.view_count}</div>
              <div className="text-xs text-muted-foreground">+1 views since last 7 days</div>
            </div>
            <div className="p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Account Statistics</h2>
          
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-medium">{completionPercentage}% completed</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            {!isComplete && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Your profile isn't complete yet!</div>
                  <div className="text-xs text-muted-foreground">Complete your profile to make it 100% discoverable and appealing.</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {completionItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                  onClick={() => navigate(item.route)}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded border border-border" />
                    )}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manage Account */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Manage your account</h2>
          <p className="text-sm text-muted-foreground">Change your email, username and more.</p>
          
          <Button variant="secondary" className="w-full justify-start">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Change Username
          </Button>

          <Button variant="secondary" className="w-full justify-start">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Change Display Name
          </Button>

          <Button variant="secondary" className="w-full justify-start">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
            Want more? Unlock with Premium
          </Button>

          <Button variant="secondary" className="w-full justify-start" onClick={() => navigate("/account/settings")}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Account Settings
          </Button>
        </div>


        {/* Account Analytics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Account Analytics</h2>
            <Button variant="link" size="sm" onClick={() => navigate("/account/analytics")}>View More</Button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">Profile Views in the last 7 days</div>
            <div className="h-32 flex items-end justify-end gap-1">
              {[5, 10, 15, 25, 35, 50, 80].map((height, i) => (
                <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-4">Visitor Devices in the last 7 days</div>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="hsl(var(--primary))" strokeWidth="20" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-2xl font-bold">Total</div>
                  <div className="text-sm text-muted-foreground">1 Visitors</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Desktop</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Mobile</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Tablet</span>
              </div>
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-medium mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Top Countries by Views
            </div>
            <div className="text-center text-muted-foreground text-sm py-4">
              No country data available yet
            </div>
          </div>

          {/* Top Clicked Links */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-medium mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Top Clicked Links
            </div>
            <div className="text-center text-muted-foreground text-sm py-4">
              No link click data available yet
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
