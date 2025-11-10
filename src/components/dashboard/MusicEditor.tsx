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
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});

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

  const handleFileSelect = (trackId: string, file: File) => {
    setSelectedFiles(prev => ({ ...prev, [trackId]: file.name }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={addMusic} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Audio
        </Button>
      </div>

      <div className="space-y-3">
        {music.map((track) => (
          <div key={track.id} className="bg-background/50 p-3 rounded-lg space-y-2">
            <div>
              <Label className="text-sm">Audio Title</Label>
              <div className="relative mt-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                <Input
                  value={track.title}
                  onChange={(e) => updateMusic(track.id, "title", e.target.value)}
                  placeholder="Add a title..."
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Upload Audio File (MP3)</Label>
              <div className="mt-1">
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(track.id, file);
                      // Upload to Supabase
                      const uploadFile = async () => {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${crypto.randomUUID()}.${fileExt}`;
                        const { data, error } = await supabase.storage
                          .from('music')
                          .upload(fileName, file);
                        if (!error && data) {
                          const { data: { publicUrl } } = supabase.storage
                            .from('music')
                            .getPublicUrl(fileName);
                          updateMusic(track.id, "url", publicUrl);
                        }
                      };
                      uploadFile();
                    }
                  }}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {selectedFiles[track.id] && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Selected: {selectedFiles[track.id]}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm">Upload Audio Cover (Optional)</Label>
              <div className="mt-1">
                <FileUpload
                  bucket="music"
                  onUpload={(url) => updateMusic(track.id, "cover_url", url)}
                  accept="image/*"
                  label="Click to upload cover"
                />
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeMusic(track.id, track.isNew)}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={saveMusic} className="w-full">
        Save Audio
      </Button>
    </div>
  );
};

export default MusicEditor;