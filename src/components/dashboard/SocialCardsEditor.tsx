import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { 
  FaDiscord, FaTwitter, FaYoutube, FaTwitch, FaSpotify,
  FaInstagram, FaTiktok, FaGithub, FaSteam
} from "react-icons/fa";
import { SiRoblox, SiValorant } from "react-icons/si";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    description: "Show your Discord server, presence, or bot on your profile.",
    contentTypes: [
      { id: "presence", label: "Rich Presence (User ID)", placeholder: "Your Discord User ID (e.g., 123456789012345678)" },
      { id: "server", label: "Server Link", placeholder: "Discord server invite link" },
      { id: "bot", label: "Bot Invite", placeholder: "Discord bot invite link" },
    ]
  },
  { 
    id: "github", 
    name: "GitHub", 
    icon: FaGithub, 
    color: "#181717", 
    description: "Show your GitHub profile with followers and repositories count on your profile.",
    placeholder: "Username" 
  },
  { 
    id: "roblox", 
    name: "Roblox", 
    icon: SiRoblox, 
    color: "#E2231A",
    description: "Show your Roblox profile with followers and friends count on your profile.",
    contentTypes: [
      { id: "user", label: "Player Profile", placeholder: "Roblox username or user ID" },
      { id: "game", label: "Game/Experience", placeholder: "Roblox game/experience link" },
      { id: "group", label: "Group", placeholder: "Roblox group link" },
    ]
  },
  { 
    id: "telegram", 
    name: "Telegram", 
    icon: FaDiscord, 
    color: "#0088cc",
    description: "Show your Telegram channel with member count on your profile.",
    placeholder: "Channel username" 
  },
  { 
    id: "lastfm", 
    name: "Last.fm", 
    icon: FaSpotify, 
    color: "#d51007",
    description: "Show your Last.fm profile with scrobbles or recent tracks on your profile.",
    placeholder: "Username" 
  },
  { 
    id: "statsfm", 
    name: "Stats.fm", 
    icon: FaSpotify, 
    color: "#1DB954",
    description: "Show your Stats.fm profile with scrobbles or recent tracks on your profile.",
    placeholder: "Username" 
  },
  { 
    id: "valorant", 
    name: "Valorant", 
    icon: SiValorant, 
    color: "#FF4655",
    description: "Show your Valorant rank, stats and level on your profile.",
    placeholder: "Username (e.g. curet#1234)",
    hasDisplayMode: true,
  },
  { 
    id: "chess", 
    name: "Chess", 
    icon: FaGithub, 
    color: "#769656",
    description: "Show your Chess player or club info on your profile.",
    placeholder: "Username" 
  },
  { id: "twitter", name: "X (Twitter)", icon: FaTwitter, color: "#1DA1F2", description: "Show your X (Twitter) profile with follower and following count on your profile.", placeholder: "Username (without @)" },
  { id: "youtube", name: "YouTube", icon: FaYoutube, color: "#FF0000", description: "Show your YouTube profile with subscriber count on your profile.", placeholder: "Channel ID or Username" },
  { id: "twitch", name: "Twitch", icon: FaTwitch, color: "#9146FF", description: "Show your Twitch profile with follower count on your profile.", placeholder: "Username" },
  { 
    id: "spotify", 
    name: "Spotify", 
    icon: FaSpotify, 
    color: "#1DB954",
    description: "Show your Spotify track, album, or playlist on your profile.",
    contentTypes: [
      { id: "presence", label: "Now Playing (Discord ID)", placeholder: "Your Discord User ID for Spotify presence" },
      { id: "profile", label: "Profile Link", placeholder: "Spotify profile URL" },
      { id: "track", label: "Track Link", placeholder: "Spotify track link" },
      { id: "album", label: "Album Link", placeholder: "Spotify album link" },
      { id: "playlist", label: "Playlist Link", placeholder: "Spotify playlist link" },
      { id: "artist", label: "Artist Link", placeholder: "Spotify artist link" },
    ]
  },
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "#E4405F", description: "Show your Instagram profile with follower count on your profile.", placeholder: "Username (without @)" },
  { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "#000000", description: "Show your TikTok profile with follower count and hearts on your profile.", placeholder: "Username (without @)" },
  { id: "steam", name: "Steam", icon: FaSteam, color: "#000000", description: "Show your Steam profile with avatar, username, friends count, and level on your profile.", placeholder: "Profile URL or Username" },
  { id: "minecraft", name: "Minecraft", icon: FaGithub, color: "#62B47A", description: "Show your Minecraft server with player count on your profile.", placeholder: "Server IP" },
  { id: "clashofclans", name: "Clash of Clans", icon: FaGithub, color: "#f5c211", description: "Show your Clash of Clans player or clan info on your profile.", placeholder: "Player tag" },
];

const SocialCardsEditor = ({ profileId }: SocialCardsEditorProps) => {
  const [cards, setCards] = useState<SocialCard[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { identifier: string; contentType?: string; displayMode?: string }>>({});
  const [isEnabled, setIsEnabled] = useState(true);
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
    
    const cardsData = (data as SocialCard[]) || [];
    setCards(cardsData);
    
    // Initialize selected platforms and form data from existing cards
    const selected = new Set<string>();
    const formDataInit: Record<string, { identifier: string; contentType?: string; displayMode?: string }> = {};
    
    cardsData.forEach(card => {
      selected.add(card.platform);
      formDataInit[card.platform] = {
        identifier: card.identifier,
        contentType: card.extra_data?.content_type,
        displayMode: card.extra_data?.display_mode || "current",
      };
    });
    
    setSelectedPlatforms(selected);
    setFormData(formDataInit);
  };

  const handlePlatformToggle = async (platformId: string) => {
    const newSelected = new Set(selectedPlatforms);
    
    if (newSelected.has(platformId)) {
      // Remove the card
      const cardToRemove = cards.find(c => c.platform === platformId);
      if (cardToRemove) {
        await supabase.from("social_cards").delete().eq("id", cardToRemove.id);
      }
      newSelected.delete(platformId);
      setExpandedPlatform(null);
    } else {
      // Select the platform (don't add to DB yet - wait for form submission)
      newSelected.add(platformId);
      setExpandedPlatform(platformId);
    }
    
    setSelectedPlatforms(newSelected);
    loadCards();
  };

  const handleSaveCard = async (platformId: string) => {
    const data = formData[platformId];
    if (!data?.identifier?.trim()) {
      toast.error("Please enter the required information");
      return;
    }

    setLoading(true);
    try {
      const existingCard = cards.find(c => c.platform === platformId);
      const extraData: Record<string, any> = {};
      
      if (data.contentType) {
        extraData.content_type = data.contentType;
      }
      if (data.displayMode) {
        extraData.display_mode = data.displayMode;
      }

      if (existingCard) {
        // Update existing card
        await supabase
          .from("social_cards")
          .update({
            identifier: data.identifier.trim(),
            extra_data: Object.keys(extraData).length > 0 ? extraData : null,
          })
          .eq("id", existingCard.id);
      } else {
        // Create new card
        await supabase
          .from("social_cards")
          .insert({
            profile_id: profileId,
            platform: platformId,
            identifier: data.identifier.trim(),
            order_index: cards.length,
            extra_data: Object.keys(extraData).length > 0 ? extraData : null,
          });
      }

      toast.success("Social card saved!");
      setExpandedPlatform(null);
      loadCards();
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDeleteCard = async (platformId: string) => {
    const card = cards.find(c => c.platform === platformId);
    if (card) {
      await supabase.from("social_cards").delete().eq("id", card.id);
      const newSelected = new Set(selectedPlatforms);
      newSelected.delete(platformId);
      setSelectedPlatforms(newSelected);
      setExpandedPlatform(null);
      loadCards();
      toast.success("Social card removed!");
    }
  };

  const getPlatformInfo = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
          <Share2 className="w-6 h-6" />
          Social Integration
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isEnabled ? "text-green-500" : "text-muted-foreground"}`}>
            {isEnabled ? "● Enabled" : "○ Disabled"}
          </span>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.has(platform.id);
          const isExpanded = expandedPlatform === platform.id;
          const hasContentTypes = 'contentTypes' in platform && platform.contentTypes;

          return (
            <Collapsible
              key={platform.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedPlatform(open ? platform.id : null)}
            >
              <div
                className={`rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-foreground/10 bg-card/30 hover:border-foreground/20"
                }`}
              >
                {/* Platform Header */}
                <CollapsibleTrigger asChild>
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => {
                      if (!isSelected) {
                        handlePlatformToggle(platform.id);
                      }
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isSelected ? platform.color : `${platform.color}40` }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{platform.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {platform.description}
                      </p>
                    </div>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(platform.id);
                        }}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                    {isSelected && (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>

                {/* Expanded Configuration */}
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-foreground/10 pt-4">
                    {/* Content Type Selection for platforms with multiple types */}
                    {hasContentTypes && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Content Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {(platform as any).contentTypes.map((ct: any) => (
                            <button
                              key={ct.id}
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                [platform.id]: { ...prev[platform.id], contentType: ct.id }
                              }))}
                              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                formData[platform.id]?.contentType === ct.id
                                  ? "border-primary bg-primary/20 text-primary"
                                  : "border-foreground/20 hover:border-foreground/40"
                              }`}
                            >
                              {ct.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Username/Identifier Input */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        {hasContentTypes && formData[platform.id]?.contentType
                          ? (platform as any).contentTypes.find((ct: any) => ct.id === formData[platform.id]?.contentType)?.placeholder
                          : (platform as any).placeholder || "Username"}
                      </Label>
                      <Input
                        value={formData[platform.id]?.identifier || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [platform.id]: { ...prev[platform.id], identifier: e.target.value }
                        }))}
                        placeholder={hasContentTypes && formData[platform.id]?.contentType
                          ? (platform as any).contentTypes.find((ct: any) => ct.id === formData[platform.id]?.contentType)?.placeholder
                          : (platform as any).placeholder || "Enter username"}
                        className="bg-card/50 border-foreground/20"
                      />
                    </div>

                    {/* Display Mode for Valorant */}
                    {platform.id === "valorant" && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Display Mode</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              [platform.id]: { ...prev[platform.id], displayMode: "current" }
                            }))}
                            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                              (formData[platform.id]?.displayMode || "current") === "current"
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-foreground/20 hover:border-foreground/40"
                            }`}
                          >
                            Current
                          </button>
                          <button
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              [platform.id]: { ...prev[platform.id], displayMode: "highest" }
                            }))}
                            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                              formData[platform.id]?.displayMode === "highest"
                                ? "border-foreground bg-foreground/10"
                                : "border-foreground/20 hover:border-foreground/40"
                            }`}
                          >
                            Highest
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <Button
                      onClick={() => handleSaveCard(platform.id)}
                      disabled={loading || !formData[platform.id]?.identifier?.trim()}
                      className="w-full"
                      size="sm"
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default SocialCardsEditor;
