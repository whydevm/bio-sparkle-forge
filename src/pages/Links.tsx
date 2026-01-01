import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Cloud } from "lucide-react";
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
  SiSteam,
  SiRoblox,
} from "react-icons/si";

interface ContentType {
  value: string;
  label: string;
  placeholder: string;
}

interface PlatformOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  contentTypes?: ContentType[];
  baseUrl?: string;
}

const platformOptions: PlatformOption[] = [
  { value: "snapchat", label: "Snapchat", icon: SiSnapchat, color: "#FFFC00", baseUrl: "snapchat.com/add/" },
  { value: "youtube", label: "YouTube", icon: SiYoutube, color: "#FF0000", baseUrl: "youtube.com/@" },
  { 
    value: "discord", 
    label: "Discord", 
    icon: SiDiscord, 
    color: "#5865F2",
    contentTypes: [
      { value: "user", label: "Username", placeholder: "username" },
      { value: "server", label: "Server Link", placeholder: "discord.gg/invite-code" },
      { value: "bot", label: "Bot Invite", placeholder: "bot-client-id" },
    ]
  },
  { 
    value: "spotify", 
    label: "Spotify", 
    icon: SiSpotify, 
    color: "#1DB954",
    contentTypes: [
      { value: "user", label: "Profile", placeholder: "username" },
      { value: "track", label: "Track", placeholder: "track-id or full URL" },
      { value: "album", label: "Album", placeholder: "album-id or full URL" },
      { value: "playlist", label: "Playlist", placeholder: "playlist-id or full URL" },
    ]
  },
  { value: "instagram", label: "Instagram", icon: SiInstagram, color: "#E4405F", baseUrl: "instagram.com/" },
  { value: "twitter", label: "X", icon: SiX, color: "#000000", baseUrl: "x.com/" },
  { value: "tiktok", label: "TikTok", icon: SiTiktok, color: "#000000", baseUrl: "tiktok.com/@" },
  { value: "telegram", label: "Telegram", icon: SiTelegram, color: "#26A5E4", baseUrl: "t.me/" },
  { value: "soundcloud", label: "SoundCloud", icon: SiSoundcloud, color: "#FF5500", baseUrl: "soundcloud.com/" },
  { value: "paypal", label: "PayPal", icon: SiPaypal, color: "#00457C", baseUrl: "paypal.me/" },
  { value: "github", label: "GitHub", icon: SiGithub, color: "#181717", baseUrl: "github.com/" },
  { value: "applemusic", label: "Apple Music", icon: SiApplemusic, color: "#FA243C", baseUrl: "music.apple.com/" },
  { value: "gitlab", label: "GitLab", icon: SiGitlab, color: "#FC6D26", baseUrl: "gitlab.com/" },
  { value: "twitch", label: "Twitch", icon: SiTwitch, color: "#9146FF", baseUrl: "twitch.tv/" },
  { value: "reddit", label: "Reddit", icon: SiReddit, color: "#FF4500", baseUrl: "reddit.com/u/" },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin, color: "#0A66C2", baseUrl: "linkedin.com/in/" },
  { value: "steam", label: "Steam", icon: SiSteam, color: "#000000", baseUrl: "steamcommunity.com/id/" },
  { 
    value: "roblox", 
    label: "Roblox", 
    icon: SiRoblox, 
    color: "#E2231A",
    contentTypes: [
      { value: "user", label: "Profile", placeholder: "user-id" },
      { value: "game", label: "Game", placeholder: "game-id" },
      { value: "group", label: "Group", placeholder: "group-id" },
    ]
  },
  { 
    value: "weather", 
    label: "Weather", 
    icon: Cloud, 
    color: "#4A90D9",
    contentTypes: [
      { value: "location", label: "Location", placeholder: "City, Country (e.g. London, UK)" },
    ]
  },
];

const Links = () => {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>("user");
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

  const handlePlatformClick = (platform: PlatformOption) => {
    setSelectedPlatform(platform);
    setSelectedContentType(platform.contentTypes?.[0]?.value || "user");
    setLinkUrl("");
    setDialogOpen(true);
  };

  const handleAddLink = async () => {
    if (!linkUrl || !selectedPlatform || !profile) return;

    try {
      let fullUrl = "";
      const platform = selectedPlatform.value;

      // Build URL based on platform and content type
      if (platform === "discord") {
        if (selectedContentType === "server") {
          fullUrl = linkUrl.startsWith("http") ? linkUrl : `https://discord.gg/${linkUrl}`;
        } else if (selectedContentType === "bot") {
          fullUrl = `https://discord.com/oauth2/authorize?client_id=${linkUrl}&permissions=0&scope=bot`;
        } else {
          fullUrl = `https://discord.com/users/${linkUrl}`;
        }
      } else if (platform === "spotify") {
        if (selectedContentType === "track") {
          fullUrl = linkUrl.startsWith("http") ? linkUrl : `https://open.spotify.com/track/${linkUrl}`;
        } else if (selectedContentType === "album") {
          fullUrl = linkUrl.startsWith("http") ? linkUrl : `https://open.spotify.com/album/${linkUrl}`;
        } else if (selectedContentType === "playlist") {
          fullUrl = linkUrl.startsWith("http") ? linkUrl : `https://open.spotify.com/playlist/${linkUrl}`;
        } else {
          fullUrl = `https://open.spotify.com/user/${linkUrl}`;
        }
      } else if (platform === "roblox") {
        if (selectedContentType === "game") {
          fullUrl = `https://www.roblox.com/games/${linkUrl}`;
        } else if (selectedContentType === "group") {
          fullUrl = `https://www.roblox.com/groups/${linkUrl}`;
        } else {
          fullUrl = `https://www.roblox.com/users/${linkUrl}/profile`;
        }
      } else if (platform === "weather") {
        fullUrl = `weather:${linkUrl}`;
      } else {
        fullUrl = `https://${selectedPlatform.baseUrl || `${platform}.com/`}${linkUrl}`;
      }
      
      const { error } = await supabase.from("social_links").insert({
        profile_id: profile.id,
        platform: selectedPlatform.value,
        label: selectedPlatform.label,
        url: fullUrl,
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

  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("social_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Link deleted successfully!");
      loadLinks(profile.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getContentTypeForPlatform = () => {
    if (!selectedPlatform?.contentTypes) return null;
    return selectedPlatform.contentTypes.find(ct => ct.value === selectedContentType);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  const Icon = selectedPlatform?.icon;

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

        {/* Display existing links */}
        {links.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-lg font-medium mb-3">Your Links</h2>
            {links.map((link) => {
              const platformInfo = platformOptions.find(p => p.value === link.platform);
              const PlatformIcon = platformInfo?.icon;
              return (
                <div 
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    {PlatformIcon && (
                      <PlatformIcon 
                        className="w-6 h-6" 
                        style={{ color: platformInfo?.color }}
                      />
                    )}
                    <div>
                      <p className="font-medium">{link.label}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{link.url}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

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
                {Icon && selectedPlatform && (
                  <>
                    <Icon className="w-6 h-6" style={{ color: selectedPlatform.color }} />
                    Add {selectedPlatform.label}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Content type selector for platforms with multiple types */}
              {selectedPlatform?.contentTypes && selectedPlatform.contentTypes.length > 1 && (
                <div>
                  <Label className="flex items-center gap-2 text-sm mb-2">
                    Content Type
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatform.contentTypes.map((ct) => (
                      <Button 
                        key={ct.value}
                        variant={selectedContentType === ct.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedContentType(ct.value)}
                      >
                        {ct.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-background/50 rounded-lg p-3">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  {getContentTypeForPlatform()?.label || selectedPlatform?.label}
                </Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={getContentTypeForPlatform()?.placeholder || "Enter your username or link"}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddLink} className="flex-1">
                  Add
                </Button>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
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
