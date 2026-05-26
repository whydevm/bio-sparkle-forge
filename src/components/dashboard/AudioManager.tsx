import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Music, Plus, Upload, Shuffle, Volume2, Pin, Image, Trash2, Play, X, Mic2, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface AudioManagerProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  audioShuffle?: boolean;
  showAudioPlayer?: boolean;
  audioSticky?: boolean;
  onSettingsChange: (settings: { audio_shuffle?: boolean; show_audio_player?: boolean; audio_sticky?: boolean }) => void;
}

const AudioManager = ({ 
  open, 
  onClose, 
  profileId,
  audioShuffle,
  showAudioPlayer,
  audioSticky,
  onSettingsChange 
}: AudioManagerProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [music, setMusic] = useState<any[]>([]);
  const [newTrack, setNewTrack] = useState({
    title: "",
    url: "",
    cover_url: ""
  });
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && profileId) {
      loadMusic();
    }
  }, [open, profileId]);

  const loadMusic = async () => {
    const { data } = await supabase
      .from("profile_music")
      .select("*")
      .eq("profile_id", profileId)
      .order("order_index");
    setMusic(data || []);
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAudioFile(file);
      setAudioPreviewUrl(file.name);
      // Auto-fill title from filename
      const titleFromFile = file.name.replace(/\.[^/.]+$/, "");
      if (!newTrack.title) {
        setNewTrack({ ...newTrack, title: titleFromFile });
      }
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  };

  const handleAddAudio = async () => {
    if (!selectedAudioFile || !newTrack.title) {
      toast.error("Please add an audio file and title");
      return;
    }
    
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload audio file
      const audioExt = selectedAudioFile.name.split(".").pop();
      const audioFileName = `${user.id}/${Date.now()}.${audioExt}`;
      
      const { error: audioError } = await supabase.storage
        .from("music")
        .upload(audioFileName, selectedAudioFile, { upsert: true });
      
      if (audioError) throw audioError;
      
      const { data: audioData } = supabase.storage.from("music").getPublicUrl(audioFileName);
      
      // Upload cover if provided
      let coverUrl = "";
      if (selectedCoverFile) {
        const coverExt = selectedCoverFile.name.split(".").pop();
        const coverFileName = `${user.id}/cover-${Date.now()}.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from("music")
          .upload(coverFileName, selectedCoverFile, { upsert: true });
        
        if (!coverError) {
          const { data: coverData } = supabase.storage.from("music").getPublicUrl(coverFileName);
          coverUrl = coverData.publicUrl;
        }
      }

      // Add to database
      await supabase.from("profile_music").insert({
        profile_id: profileId,
        title: newTrack.title,
        url: audioData.publicUrl,
        cover_url: coverUrl,
        order_index: music.length
      });

      toast.success("Audio added!");
      loadMusic();
      handleCloseAddModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    await supabase.from("profile_music").delete().eq("id", id);
    loadMusic();
    toast.success("Track removed");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewTrack({ title: "", url: "", cover_url: "" });
    setSelectedAudioFile(null);
    setSelectedCoverFile(null);
    setAudioPreviewUrl(null);
    setCoverPreviewUrl(null);
  };

  // Add Audio sub-modal
  if (showAddModal) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <DialogTitle className="text-base">Add Audio</DialogTitle>
                <p className="text-xs text-muted-foreground">Upload an audio file</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Audio file upload */}
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors bg-background/50"
            >
              {audioPreviewUrl ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{audioPreviewUrl}</p>
                    <p className="text-xs text-muted-foreground">Audio file selected</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAudioFile(null);
                      setAudioPreviewUrl(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Click to upload audio</p>
                    <p className="text-xs text-muted-foreground">MP3, WAV, OGG</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileSelect}
              className="hidden"
            />

            {/* Cover image */}
            <div className="flex gap-3">
              <div
                onClick={() => coverInputRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background/50 flex-shrink-0"
              >
                {coverPreviewUrl ? (
                  <img src={coverPreviewUrl} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Image className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  value={newTrack.title}
                  onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value.slice(0, 64) })}
                  placeholder="Song title"
                  className="bg-background/50 border-border text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">{newTrack.title.length}/64</p>
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileSelect}
              className="hidden"
            />

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCloseAddModal} className="flex-1" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleAddAudio}
                disabled={!selectedAudioFile || !newTrack.title || uploading}
                className="flex-1"
                size="sm"
              >
                {uploading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Audio Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Your Audios section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Your Audios ({music.length}/3)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                disabled={music.length >= 3}
                className="h-8 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
            
            {music.length > 0 ? (
              <div className="space-y-2">
                {music.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Music className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="flex-1 text-sm truncate">{track.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTrack(track.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                <Music className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No audio files yet</span>
              </div>
            )}
          </div>

          {/* Audio Settings */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Settings</h3>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Shuffle</span>
              </div>
              <Switch 
                checked={audioShuffle} 
                onCheckedChange={(checked) => onSettingsChange({ audio_shuffle: checked })} 
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Show Player</span>
              </div>
              <Switch 
                checked={showAudioPlayer ?? true} 
                onCheckedChange={(checked) => onSettingsChange({ show_audio_player: checked })} 
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Sticky</span>
              </div>
              <Switch 
                checked={audioSticky ?? false} 
                onCheckedChange={(checked) => onSettingsChange({ audio_sticky: checked })} 
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioManager;