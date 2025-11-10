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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={addMusic} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Audio
        </Button>
      </div>

      <div className="space-y-4">
        {music.map((track) => (
          <div key={track.id} className="bg-background/50 p-4 rounded-lg space-y-3">
            <div>
              <Label>Audio Title</Label>
              <div className="relative mt-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                <Input
                  value={track.title}
                  onChange={(e) => updateMusic(track.id, "title", e.target.value)}
                  placeholder="Add a title..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Upload Audio File</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                  <FileUpload
                    bucket="music"
                    onUpload={(url) => updateMusic(track.id, "url", url)}
                    accept="audio/*"
                    label="Click to upload an audio"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Upload Audio Cover (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-muted-foreground">Click to upload an audio cover</span>
                </div>
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
        Add Audio
      </Button>
    </div>
  );
};

export default MusicEditor;