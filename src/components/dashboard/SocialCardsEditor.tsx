import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { 
  FaDiscord, FaTwitter, FaYoutube, FaTwitch, FaSpotify,
  FaInstagram, FaTiktok, FaGithub, FaSteam
} from "react-icons/fa";
import { SiRoblox } from "react-icons/si";

interface SocialCard {
  id: string;
  platform: string;
  identifier: string;
  display_name?: string;
  avatar_url?: string;
  follower_count?: number;
  extra_data?: any;
  order_index: number;
}

interface SocialCardsEditorProps {
  profileId: string;
}

const PLATFORMS = [
  { 
    id: "discord", 
    name: "Discord", 
    icon: FaDiscord, 
    color: "#5865F2", 
    contentTypes: [
      { id: "presence", label: "Rich Presence (User ID)", placeholder: "Your Discord User ID (e.g., 123456789012345678)" },
      { id: "server", label: "Server Link", placeholder: "Discord server invite link" },
      { id: "bot", label: "Bot Invite", placeholder: "Discord bot invite link" },
    ]
  },
  { id: "twitter", name: "Twitter/X", icon: FaTwitter, color: "#1DA1F2", placeholder: "Username (without @)" },
  { id: "youtube", name: "YouTube", icon: FaYoutube, color: "#FF0000", placeholder: "Channel ID or Username" },
  { id: "twitch", name: "Twitch", icon: FaTwitch, color: "#9146FF", placeholder: "Username" },
  { 
    id: "spotify", 
    name: "Spotify", 
    icon: FaSpotify, 
    color: "#1DB954",
    contentTypes: [
      { id: "presence", label: "Now Playing (Discord ID)", placeholder: "Your Discord User ID for Spotify presence" },
      { id: "profile", label: "Profile Link", placeholder: "Spotify profile URL" },
      { id: "track", label: "Track Link", placeholder: "Spotify track link" },
      { id: "album", label: "Album Link", placeholder: "Spotify album link" },
      { id: "playlist", label: "Playlist Link", placeholder: "Spotify playlist link" },
      { id: "artist", label: "Artist Link", placeholder: "Spotify artist link" },
    ]
  },
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "#E4405F", placeholder: "Username (without @)" },
  { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "#000000", placeholder: "Username (without @)" },
  { id: "github", name: "GitHub", icon: FaGithub, color: "#181717", placeholder: "Username" },
  { id: "steam", name: "Steam", icon: FaSteam, color: "#000000", placeholder: "Profile URL or Username" },
  { 
    id: "roblox", 
    name: "Roblox", 
    icon: SiRoblox, 
    color: "#E2231A",
    contentTypes: [
      { id: "user", label: "Player Profile", placeholder: "Roblox username or user ID" },
      { id: "game", label: "Game/Experience", placeholder: "Roblox game/experience link" },
      { id: "group", label: "Group", placeholder: "Roblox group link" },
    ]
  },
];

const SocialCardsEditor = ({ profileId }: SocialCardsEditorProps) => {
  const [cards, setCards] = useState<SocialCard[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, [profileId]);

  const loadCards = async () => {
    const { data } = await supabase
      .from("social_cards")
      .select("*")
      .eq("profile_id", profileId)
      .order("order_index");
    setCards((data as SocialCard[]) || []);
  };

  const handleAddCard = async () => {
    if (!selectedPlatform || !identifier.trim()) {
      toast.error("Please select a platform and enter an identifier");
      return;
    }

    // Check if content type is required but not selected
    const platform = getSelectedPlatform();
    if (platform && 'contentTypes' in platform && platform.contentTypes && !selectedContentType) {
      toast.error("Please select a content type");
      return;
    }

    if (cards.length >= 3) {
      toast.error("You can only have up to 3 social cards");
      return;
    }

    setLoading(true);
    try {
      // Build extra_data with content_type if applicable
      const extraData: Record<string, any> = {};
      if (selectedContentType) {
        extraData.content_type = selectedContentType;
      }

      const { error } = await supabase
        .from("social_cards")
        .insert({
          profile_id: profileId,
          platform: selectedPlatform,
          identifier: identifier.trim(),
          order_index: cards.length,
          extra_data: Object.keys(extraData).length > 0 ? extraData : null,
        });

      if (error) throw error;
      toast.success("Social card added!");
      setIsDialogOpen(false);
      setSelectedPlatform("");
      setSelectedContentType("");
      setIdentifier("");
      loadCards();
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from("social_cards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;
      toast.success("Social card removed!");
      loadCards();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getPlatformInfo = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  const getSelectedPlatform = () => getPlatformInfo(selectedPlatform);
  const hasContentTypes = () => {
    const platform = getSelectedPlatform();
    return platform && 'contentTypes' in platform && platform.contentTypes;
  };
  
  const getPlaceholder = () => {
    const platform = getSelectedPlatform();
    if (!platform) return "Enter identifier";
    
    if ('contentTypes' in platform && platform.contentTypes && selectedContentType) {
      const contentType = platform.contentTypes.find(ct => ct.id === selectedContentType);
      return contentType?.placeholder || "Enter identifier";
    }
    
    return 'placeholder' in platform ? platform.placeholder : "Enter identifier";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          Social Cards
        </h3>
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          disabled={cards.length >= 3}
          className="border-primary text-primary hover:bg-primary/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Add up to 3 social cards to display on your profile. ({cards.length}/3)
      </p>

      {cards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No social cards yet. Add your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => {
            const platform = getPlatformInfo(card.platform);
            const Icon = platform?.icon;
            return (
              <div
                key={card.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/30"
              >
                {Icon && (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: platform?.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{platform?.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {card.identifier}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 bg-red-600/20 border-red-600 hover:bg-red-600/30"
                  onClick={() => handleDeleteCard(card.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-lg">🔗</span>
              </div>
              <div>
                <div className="font-semibold">Add Social Card</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Connect your social accounts
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="bg-card/50 border-border">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: platform.color }} />
                          {platform.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type Selection - only for platforms with content types */}
            {hasContentTypes() && (
              <div>
                <Label className="mb-2 block">Content Type</Label>
                <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                  <SelectTrigger className="bg-card/50 border-border">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(getSelectedPlatform() as any)?.contentTypes?.map((ct: any) => (
                      <SelectItem key={ct.id} value={ct.id}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="mb-2 block">
                {getPlaceholder()}
              </Label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="bg-card/50 border-border"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddCard} disabled={loading} className="flex-1">
                {loading ? "Adding..." : "Add Card"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialCardsEditor;
