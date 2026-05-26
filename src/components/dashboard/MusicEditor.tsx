import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Mic2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";

interface MusicEditorProps {
  profileId: string;
}

const MusicEditor = ({ profileId }: MusicEditorProps) => {
  const [music, setMusic] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});
  const [fetchingId, setFetchingId] = useState<string | null>(null);

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
        artist: "",
        lrc: "",
        url: "",
        type: "youtube",
        order_index: music.length,
        isNew: true,
      },
    ]);
  };

  const fetchLyrics = async (id: string) => {
    const track = music.find((t) => t.id === id);
    if (!track?.title) {
      toast.error("Add a song title first");
      return;
    }
    setFetchingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-lyrics", {
        body: { title: track.title, artist: track.artist || undefined },
      });
      if (error) throw error;
      if (data?.lrc) {
        updateMusic(id, "lrc", data.lrc);
        updateMusic(id, "lyrics_source", "lrclib");
        toast.success("Synced lyrics found!");
      } else if (data?.plain) {
        toast.message("Only plain lyrics available — paste an LRC for sync");
      } else {
        toast.error("No lyrics found. Paste an LRC manually below.");
      }
    } catch (e: any) {
      toast.error(e.message || "Lyrics fetch failed");
    }
    setFetchingId(null);
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

      <div className="space-y-2">
        {music.map((track) => (
          <div key={track.id} className="bg-background/50 p-2 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 relative">
                {track.cover_url ? (
                  <div className="relative">
                    <img src={track.cover_url} alt={track.title} className="w-16 h-16 rounded object-cover" />
                    {track.url && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                        ACTIVE
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center relative">
                    <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                    {track.url && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                        ACTIVE
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  value={track.title}
                  onChange={(e) => updateMusic(track.id, "title", e.target.value)}
                  placeholder="Audio title..."
                  className="text-sm h-8"
                />

                <div className="space-y-1">
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(track.id, file);
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
                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                  />
                  {selectedFiles[track.id] && (
                    <div className="text-[10px] text-muted-foreground">
                      {selectedFiles[track.id]}
                    </div>
                  )}
                </div>

                <FileUpload
                  bucket="music"
                  onUpload={(url) => updateMusic(track.id, "cover_url", url)}
                  accept="image/*"
                  label="+ Cover"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMusic(track.id, track.isNew)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
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