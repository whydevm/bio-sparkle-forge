import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Check, AlertCircle, ChevronRight, Globe, Link as LinkIcon, BarChart3, FolderKanban, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountryView {
  country_code: string;
  count: number;
}

interface LinkClick {
  link_id: string;
  label: string;
  platform: string;
  count: number;
}

interface TopProject {
  id: string;
  title: string;
  clicks: number;
}

const Overview = () => {
  const [profile, setProfile] = useState<any>(null);
  const [hasSocialLinks, setHasSocialLinks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countryViews, setCountryViews] = useState<CountryView[]>([]);
  const [topLinks, setTopLinks] = useState<LinkClick[]>([]);
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);
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

      // Load country views
      const { data: viewsData } = await supabase
        .from("profile_views")
        .select("country_code")
        .eq("profile_id", profileData.id);

      if (viewsData) {
        const countryCounts: Record<string, number> = {};
        viewsData.forEach(v => {
          const cc = v.country_code || "Unknown";
          countryCounts[cc] = (countryCounts[cc] || 0) + 1;
        });
        const sorted = Object.entries(countryCounts)
          .map(([country_code, count]) => ({ country_code, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setCountryViews(sorted);
      }

      // Load link clicks
      const { data: clicksData } = await supabase
        .from("link_clicks")
        .select("link_id")
        .eq("profile_id", profileData.id);

      if (clicksData) {
        const linkCounts: Record<string, number> = {};
        clicksData.forEach(c => {
          linkCounts[c.link_id] = (linkCounts[c.link_id] || 0) + 1;
        });

        // Get link details
        const { data: linksData } = await supabase
          .from("social_links")
          .select("id, label, platform")
          .eq("profile_id", profileData.id);

        if (linksData) {
          const linkMap = new Map(linksData.map(l => [l.id, l]));
          const sorted = Object.entries(linkCounts)
            .map(([link_id, count]) => {
              const link = linkMap.get(link_id);
              return {
                link_id,
                label: link?.label || "Unknown",
                platform: link?.platform || "Unknown",
                count
              };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          setTopLinks(sorted);
        }
      }

      // Load project clicks
      const { data: projectClicksData } = await supabase
        .from("project_clicks")
        .select("project_id")
        .eq("profile_id", profileData.id);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, title")
        .eq("profile_id", profileData.id)
        .order("order_index")
        .limit(5);

      if (projectsData) {
        const projectCounts: Record<string, number> = {};
        projectClicksData?.forEach(c => {
          projectCounts[c.project_id] = (projectCounts[c.project_id] || 0) + 1;
        });
        
        const projectsWithClicks = projectsData.map(p => ({
          ...p,
          clicks: projectCounts[p.id] || 0
        })).sort((a, b) => b.clicks - a.clicks);
        
        setTopProjects(projectsWithClicks);
      }
    }
    setLoading(false);
  };

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      US: "United States",
      GB: "United Kingdom", 
      CA: "Canada",
      DE: "Germany",
      FR: "France",
      AU: "Australia",
      JP: "Japan",
      Unknown: "Unknown"
    };
    return countries[code] || code;
  };

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
      <div className="container max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <h1 className="text-xl font-semibold">Overview</h1>

        {/* General Information */}
        <div className="space-y-2">
          <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Username</div>
              <div className="font-medium text-sm">{profile.username}</div>
            </div>
            <button className="p-1.5 hover:bg-accent rounded-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">UID</div>
              <div className="font-medium font-mono text-sm">#{profile.uid_number || 1}</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Views</div>
              <div className="font-medium text-sm">{profile.view_count}</div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />

          {!isComplete && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5 flex gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-xs">Your profile isn't complete!</div>
                <div className="text-xs text-muted-foreground">Complete it to be more discoverable.</div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {completionItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                onClick={() => navigate(item.route)}
              >
                <div className="flex items-center gap-2">
                  {item.completed ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded border border-border" />
                  )}
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </h2>
            <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => navigate("/account/analytics")}>
              View More
            </Button>
          </div>

          {/* Top Countries */}
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs font-medium mb-3 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Top Countries
            </div>
            {countryViews.length > 0 ? (
              <div className="space-y-1.5">
                {countryViews.map((cv, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span>{getCountryName(cv.country_code)}</span>
                    <span className="text-muted-foreground">{cv.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-xs py-2">
                No data yet
              </div>
            )}
          </div>

          {/* Top Links */}
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs font-medium mb-3 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5" />
              Top Clicked Links
            </div>
            {topLinks.length > 0 ? (
              <div className="space-y-1.5">
                {topLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="truncate">{link.label}</span>
                    <span className="text-muted-foreground">{link.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-xs py-2">
                No clicks yet
              </div>
            )}
          </div>

          {/* Top Projects */}
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs font-medium mb-3 flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5" />
              Top Clicked Projects
            </div>
            {topProjects.length > 0 ? (
              <div className="space-y-1.5">
                {topProjects.map((project, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#{idx + 1}</span>
                      <span className="truncate">{project.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>{project.clicks}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-xs py-2">
                No projects yet
              </div>
            )}
          </div>
        </div>

        {/* Manage Account */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Manage Account</h2>
          
          <Button variant="secondary" size="sm" className="w-full justify-start text-sm h-9" onClick={() => navigate("/dashboard")}>
            Change Display Name
          </Button>

          <Button variant="secondary" size="sm" className="w-full justify-start text-sm h-9" onClick={() => navigate("/account/settings")}>
            Account Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;