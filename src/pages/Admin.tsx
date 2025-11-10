import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Admin = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [usernameUrl, setUsernameUrl] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
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

    // Check if user has admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleData) {
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

  const handleGrantBadge = async () => {
    if (!usernameUrl || !selectedBadge) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Extract username from URL
      const username = usernameUrl.split("/").pop();
      
      // Get profile by username
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("username", username)
        .single();

      if (!targetProfile) {
        toast.error("User not found");
        return;
      }

      // Grant badge
      const { error } = await supabase
        .from("user_badges")
        .insert({
          user_id: targetProfile.user_id,
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
        setUsernameUrl("");
        setSelectedBadge("");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout username={profile?.username}>
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Grant Badge to User</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="username-url">Profile URL</Label>
                <Input
                  id="username-url"
                  placeholder="https://bio-sparkle-forge.lovable.app/username"
                  value={usernameUrl}
                  onChange={(e) => setUsernameUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the full profile URL of the user
                </p>
              </div>

              <div>
                <Label htmlFor="badge-select">Select Badge</Label>
                <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                  <SelectTrigger id="badge-select">
                    <SelectValue placeholder="Choose a badge..." />
                  </SelectTrigger>
                  <SelectContent>
                    {badges.map((badge) => (
                      <SelectItem key={badge.id} value={badge.id}>
                        {badge.icon} {badge.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGrantBadge} className="w-full">
                Grant Badge
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-3">Available Badges</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 p-2 bg-accent rounded-lg text-sm"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
