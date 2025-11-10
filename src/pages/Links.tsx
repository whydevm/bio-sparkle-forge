import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  SiTiktok,
  SiInstagram,
  SiX,
  SiDiscord,
  SiGithub,
  SiSnapchat,
  SiYoutube,
  SiTwitch,
  SiSpotify,
  SiSoundcloud,
  SiTelegram,
  SiPaypal,
  SiApplemusic,
  SiGitlab,
  SiLinkedin,
  SiReddit,
} from "react-icons/si";

const platformOptions = [
  { value: "snapchat", label: "Snapchat", icon: SiSnapchat, color: "#FFFC00" },
  { value: "youtube", label: "YouTube", icon: SiYoutube, color: "#FF0000" },
  { value: "discord", label: "Discord", icon: SiDiscord, color: "#5865F2" },
  { value: "spotify", label: "Spotify", icon: SiSpotify, color: "#1DB954" },
  { value: "instagram", label: "Instagram", icon: SiInstagram, color: "#E4405F" },
  { value: "twitter", label: "X", icon: SiX, color: "#000000" },
  { value: "tiktok", label: "TikTok", icon: SiTiktok, color: "#000000" },
  { value: "telegram", label: "Telegram", icon: SiTelegram, color: "#26A5E4" },
  { value: "soundcloud", label: "SoundCloud", icon: SiSoundcloud, color: "#FF5500" },
  { value: "paypal", label: "PayPal", icon: SiPaypal, color: "#00457C" },
  { value: "github", label: "GitHub", icon: SiGithub, color: "#181717" },
  { value: "applemusic", label: "Apple Music", icon: SiApplemusic, color: "#FA243C" },
  { value: "gitlab", label: "GitLab", icon: SiGitlab, color: "#FC6D26" },
  { value: "twitch", label: "Twitch", icon: SiTwitch, color: "#9146FF" },
  { value: "reddit", label: "Reddit", icon: SiReddit, color: "#FF4500" },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin, color: "#0A66C2" },
];

const Links = () => {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
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
      loadLinks(profileData.id);
    }
  };

  const loadLinks = async (profileId: string) => {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("order_index");

    setLinks(data || []);
  };

  const handlePlatformClick = (platform: any) => {
    setSelectedPlatform(platform);
    setLinkUrl("");
    setDialogOpen(true);
  };

  const handleAddLink = async () => {
    if (!linkUrl || !selectedPlatform || !profile) return;

    try {
      const { error } = await supabase.from("social_links").insert({
        profile_id: profile.id,
        platform: selectedPlatform.value,
        label: selectedPlatform.label,
        url: linkUrl,
        order_index: links.length,
      });

      if (error) throw error;

      toast.success("Link added successfully!");
      setDialogOpen(false);
      loadLinks(profile.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout username={profile.username}>
      <div className="container max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"/>
            </svg>
            Link your social media profiles.
          </h1>
          <p className="text-muted-foreground">Pick a social media to add to your profile.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {platformOptions.map((platform) => (
            <button
              key={platform.value}
              onClick={() => handlePlatformClick(platform)}
              className="aspect-square rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-center group"
            >
              <platform.icon 
                className="w-12 h-12"
                style={{ color: platform.color }}
              />
            </button>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPlatform && (
                  <>
                    <selectedPlatform.icon className="w-6 h-6" style={{ color: selectedPlatform.color }} />
                    Add {selectedPlatform.label} Social
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="flex items-center gap-2 text-sm">
                  Social Mode
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"/>
                    </svg>
                    Link
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Text
                  </Button>
                </div>
              </div>

              <div className="bg-background/50 rounded-lg p-3 flex items-center gap-2">
                {selectedPlatform && (
                  <selectedPlatform.icon className="w-5 h-5" style={{ color: selectedPlatform.color }} />
                )}
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={`${selectedPlatform?.value}.com/...`}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddLink} className="flex-1">
                  Add
                </Button>
                <Button variant="ghost">
                  Need help?
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Links;
