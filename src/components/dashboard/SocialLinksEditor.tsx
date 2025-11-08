import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const platforms = [
  "TikTok",
  "Instagram",
  "Twitter",
  "Discord",
  "GitHub",
  "Snapchat",
  "YouTube",
  "Twitch",
  "Spotify",
  "Roblox",
];

interface SocialLinksEditorProps {
  profileId: string;
}

const SocialLinksEditor = ({ profileId }: SocialLinksEditorProps) => {
  const [links, setLinks] = useState<any[]>([]);

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
    setLinks([
      ...links,
      {
        id: crypto.randomUUID(),
        profile_id: profileId,
        platform: "TikTok",
        label: "",
        url: "",
        order_index: links.length,
        isNew: true,
      },
    ]);
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

      <div className="space-y-4">
        {links.map((link) => (
          <div key={link.id} className="glass-panel p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
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
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
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

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeLink(link.id, link.isNew)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={saveLinks} className="w-full">
        Save All Links
      </Button>
    </div>
  );
};

export default SocialLinksEditor;