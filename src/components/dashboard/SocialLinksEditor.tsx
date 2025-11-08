import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";
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
} from "react-icons/si";

const platformOptions = [
  { value: "TikTok", label: "TikTok", icon: SiTiktok },
  { value: "Instagram", label: "Instagram", icon: SiInstagram },
  { value: "Twitter", label: "Twitter/X", icon: SiX },
  { value: "Discord-Server", label: "Discord Server", icon: SiDiscord },
  { value: "Discord-Profile", label: "Discord Profile", icon: SiDiscord },
  { value: "Discord-Bot", label: "Discord Bot", icon: SiDiscord },
  { value: "Roblox-Profile", label: "Roblox Profile", icon: null },
  { value: "Roblox-Group", label: "Roblox Group", icon: null },
  { value: "Roblox-Game", label: "Roblox Game", icon: null },
  { value: "GitHub", label: "GitHub", icon: SiGithub },
  { value: "Snapchat", label: "Snapchat", icon: SiSnapchat },
  { value: "YouTube", label: "YouTube", icon: SiYoutube },
  { value: "Twitch", label: "Twitch", icon: SiTwitch },
  { value: "Spotify", label: "Spotify", icon: SiSpotify },
];

interface SocialLinksEditorProps {
  profileId: string;
}

const SocialLinksEditor = ({ profileId }: SocialLinksEditorProps) => {
  const [links, setLinks] = useState<any[]>([]);
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLinks();
  }, [profileId]);

  const loadLinks = async () => {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("order_index");

    setLinks(data || []);
  };

  const addLink = () => {
    const newId = crypto.randomUUID();
    setLinks([
      ...links,
      {
        id: newId,
        profile_id: profileId,
        platform: "TikTok",
        label: "",
        url: "",
        custom_icon_url: null,
        order_index: links.length,
        isNew: true,
      },
    ]);
    setExpandedLinks(new Set([...expandedLinks, newId]));
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedLinks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLinks(newExpanded);
  };

  const removeLink = async (id: string, isNew: boolean) => {
    if (!isNew) {
      await supabase.from("social_links").delete().eq("id", id);
    }
    setLinks(links.filter((link) => link.id !== id));
  };

  const updateLink = (id: string, field: string, value: string) => {
    setLinks(
      links.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const saveLinks = async () => {
    try {
      for (const link of links) {
        if (link.isNew) {
          const { isNew, ...linkData } = link;
          await supabase.from("social_links").insert(linkData);
        } else {
          const { isNew, ...linkData } = link;
          await supabase.from("social_links").update(linkData).eq("id", link.id);
        }
      }
      toast.success("Links saved!");
      loadLinks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Social Links</h2>
        <Button onClick={addLink} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const platformData = platformOptions.find(p => p.value === link.platform);
          const IconComponent = platformData?.icon;
          
          return (
            <Collapsible
              key={link.id}
              open={expandedLinks.has(link.id)}
              onOpenChange={() => toggleExpand(link.id)}
            >
              <div className="glass-panel p-4 rounded-lg">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="flex items-center gap-3">
                      {link.custom_icon_url ? (
                        <img src={link.custom_icon_url} alt="" className="w-6 h-6 object-contain" />
                      ) : IconComponent ? (
                        <IconComponent className="w-6 h-6" />
                      ) : (
                        <div className="w-6 h-6 bg-muted rounded" />
                      )}
                      <span className="font-medium">
                        {link.label || platformData?.label || "New Link"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedLinks.has(link.id) ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-4 space-y-3">
                  <div>
                    <Label>Platform</Label>
                    <Select
                      value={link.platform}
                      onValueChange={(value) => updateLink(link.id, "platform", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center gap-2">
                              {platform.icon && <platform.icon className="w-4 h-4" />}
                              {platform.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(link.id, "label", e.target.value)}
                      placeholder="My TikTok"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(link.id, "url", e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Custom Icon (Optional)</Label>
                    <div className="mt-1 flex items-center gap-2">
                      {link.custom_icon_url && (
                        <img src={link.custom_icon_url} alt="" className="w-8 h-8 object-contain" />
                      )}
                      <FileUpload
                        bucket="social-icons"
                        onUpload={(url) => updateLink(link.id, "custom_icon_url", url)}
                        accept="image/*"
                        label={link.custom_icon_url ? "Change Icon" : "Upload Icon"}
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLink(link.id, link.isNew)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      <Button onClick={saveLinks} className="w-full">
        Save All Links
      </Button>
    </div>
  );
};

export default SocialLinksEditor;