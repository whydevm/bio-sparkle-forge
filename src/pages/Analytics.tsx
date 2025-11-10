import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Checkbox } from "@/components/ui/checkbox";

const Analytics = () => {
  const [profile, setProfile] = useState<any>(null);
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
    }
    setLoading(false);
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout username={profile.username}>
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <h1 className="text-2xl font-semibold">Account Analytics</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Track your profile performance and see how many people are visiting your profile.
        </p>

        {/* Time Range */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-2">Time Range</div>
          <div className="bg-primary/20 text-primary px-3 py-2 rounded-lg text-sm">
            Last updated less than a minute ago
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Checkbox id="last3days" defaultChecked />
            <label htmlFor="last3days" className="text-sm cursor-pointer">Last 3 days</label>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Total Link Clicks</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">In the last 3 days</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Click Rate</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">0.00%</div>
            <div className="text-xs text-muted-foreground">In the last 3 days</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Profile Views</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{profile.view_count}</div>
            <div className="text-xs text-muted-foreground">+1 views since last 3 days</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Average Daily Views</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">In the last 3 days</div>
          </div>
        </div>

        {/* Profile Views Chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-4">Profile Views</div>
          <div className="h-48 flex items-end justify-end gap-2">
            {[10, 20, 35, 50, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 bg-primary/80 rounded-t transition-all hover:bg-primary" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>3 Mar</span>
            <span>10 Nov</span>
          </div>
        </div>

        {/* Visitor Devices */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-4">Visitor Devices</div>
          <div className="flex items-center justify-center py-8">
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
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Desktop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>Tablet</span>
            </div>
          </div>
        </div>

        {/* Most Clicked Socials */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-4">Most Clicked Socials</div>
          <div className="text-center py-8">
            <div className="text-muted-foreground">No socials clicked yet</div>
            <div className="text-xs text-muted-foreground mt-1">
              Try sharing your guns.lol page on social media to get more clicks!
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Top Referrers</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <span className="text-sm">guns.lol</span>
            <span className="text-sm font-medium">1 clicks</span>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-4">Top Countries by Views</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded flex items-center justify-center text-xs">
                🇧🇪
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Belgium</div>
                <div className="text-xs text-muted-foreground">100% of all views</div>
              </div>
              <div className="text-sm font-medium">1 views</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
