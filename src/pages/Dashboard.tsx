import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SocialLinksEditor from "@/components/dashboard/SocialLinksEditor";
import MusicEditor from "@/components/dashboard/MusicEditor";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold glow-text">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/${profile?.username}`)}>
              View Profile
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="glass-panel p-6 rounded-xl mt-4">
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={profile?.username || ""}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Display Name</Label>
                <Input
                  value={profile?.display_name || ""}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={profile?.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input
                  value={profile?.avatar_url || ""}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="glass-panel p-6 rounded-xl mt-4">
            <div className="space-y-6">
              <div>
                <Label>Background Type</Label>
                <Select
                  value={profile?.background_type}
                  onValueChange={(value) => setProfile({ ...profile, background_type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video (MP4)</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Background URL</Label>
                <Input
                  value={profile?.background_url || ""}
                  onChange={(e) => setProfile({ ...profile, background_url: e.target.value })}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Profile Opacity: {profile?.profile_opacity || 100}%</Label>
                <Slider
                  value={[profile?.profile_opacity || 100]}
                  onValueChange={([value]) => setProfile({ ...profile, profile_opacity: value })}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Profile Blur: {profile?.profile_blur || 0}%</Label>
                <Slider
                  value={[profile?.profile_blur || 0]}
                  onValueChange={([value]) => setProfile({ ...profile, profile_blur: value })}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Username Effect</Label>
                <Select
                  value={profile?.username_effect || "none"}
                  onValueChange={(value) => setProfile({ ...profile, username_effect: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="rainbow">Rainbow</SelectItem>
                    <SelectItem value="yellow-red">Yellow-Red</SelectItem>
                    <SelectItem value="blue-purple">Blue-Purple</SelectItem>
                    <SelectItem value="pink-orange">Pink-Orange</SelectItem>
                    <SelectItem value="sparkles">Sparkles</SelectItem>
                    <SelectItem value="typewriter">Typewriter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Glow Username</Label>
                <Switch
                  checked={profile?.glow_username}
                  onCheckedChange={(checked) => setProfile({ ...profile, glow_username: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Glow Socials</Label>
                <Switch
                  checked={profile?.glow_socials}
                  onCheckedChange={(checked) => setProfile({ ...profile, glow_socials: checked })}
                />
              </div>

              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-4">
            <MusicEditor profileId={profile?.id} />
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <SocialLinksEditor profileId={profile?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;