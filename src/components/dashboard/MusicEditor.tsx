import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";

interface MusicEditorProps {
  profileId: string;
}

const MusicEditor = ({ profileId }: MusicEditorProps) => {
  const [music, setMusic] = useState<any[]>([]);

  useEffect(() => {
    loadMusic();
  }, [profileId]);

  const loadMusic = async () => {
    const { data } = await supabase
      .from("profile_music")
      .select("*")
      .eq("profile_id", profileId)
      .order("order_index");

    setMusic(data || []);
  };

  const addMusic = () => {
    setMusic([
      ...music,
      {
        id: crypto.randomUUID(),
        profile_id: profileId,
        title: "",
        url: "",
        type: "youtube",
        order_index: music.length,
        isNew: true,
      },
    ]);
  };

  const removeMusic = async (id: string, isNew: boolean) => {
    if (!isNew) {
      await supabase.from("profile_music").delete().eq("id", id);
    }
    setMusic(music.filter((m) => m.id !== id));
  };

  const updateMusic = (id: string, field: string, value: string) => {
    setMusic(
      music.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const saveMusic = async () => {
    try {
      for (const track of music) {
        if (track.isNew) {
          const { isNew, ...trackData } = track;
          await supabase.from("profile_music").insert(trackData);
        } else {
          const { isNew, ...trackData } = track;
          await supabase.from("profile_music").update(trackData).eq("id", track.id);
        }
      }
      toast.success("Music saved!");
      loadMusic();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Music</h2>
        <Button onClick={addMusic} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Track
        </Button>
      </div>

      <div className="space-y-4">
        {music.map((track) => (
          <div key={track.id} className="glass-panel p-4 rounded-lg space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={track.title}
                onChange={(e) => updateMusic(track.id, "title", e.target.value)}
                placeholder="Song Name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={track.type}
                onValueChange={(value) => updateMusic(track.id, "type", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="mp3">MP3 File</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Audio File</Label>
              <div className="mt-1 space-y-2">
                {track.type === "mp3" && (
                  <FileUpload
                    bucket="music"
                    onUpload={(url) => updateMusic(track.id, "url", url)}
                    accept="audio/*"
                    label="Upload MP3"
                  />
                )}
                <Input
                  value={track.url}
                  onChange={(e) => updateMusic(track.id, "url", e.target.value)}
                  placeholder={track.type === "youtube" ? "YouTube URL" : "MP3 URL"}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeMusic(track.id, track.isNew)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={saveMusic} className="w-full">
        Save All Tracks
      </Button>
    </div>
  );
};

export default MusicEditor;