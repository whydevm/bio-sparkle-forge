import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Music, Plus, Upload, Youtube, Shuffle, Video, Volume2, Pin, Image, Trash2 } from "lucide-react";

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
        <DialogContent className="max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <DialogTitle className="text-lg">Add New Audio</DialogTitle>
                <p className="text-sm text-muted-foreground">Upload an audio file or search YouTube for music</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Upload options */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                onClick={() => audioInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground" disabled>
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </Button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
                className="hidden"
              />
            </div>

            {/* Audio file drop zone */}
            <div>
              <label className="text-sm font-medium">Audio File</label>
              <div
                onClick={() => audioInputRef.current?.click()}
                className="mt-2 border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors min-h-[120px]"
              >
                {audioPreviewUrl ? (
                  <div className="text-center">
                    <Music className="w-8 h-8 text-primary mx-auto mb-2" />
                    <span className="text-sm text-primary">{audioPreviewUrl}</span>
                  </div>
                ) : (
                  <>
                    <Music className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click or Drop an Audio File</span>
                  </>
                )}
              </div>
            </div>

            {/* Cover image drop zone */}
            <div>
              <label className="text-sm font-medium">
                Cover Image <span className="text-muted-foreground">(optional)</span>
              </label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="mt-2 border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors min-h-[120px]"
              >
                {coverPreviewUrl ? (
                  <img src={coverPreviewUrl} alt="Cover" className="w-20 h-20 object-cover rounded" />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click or Drop a Cover Image</span>
                  </>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileSelect}
                className="hidden"
              />
            </div>

            {/* Song title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Song Title</label>
                <span className="text-xs text-muted-foreground">{newTrack.title.length}/64</span>
              </div>
              <Input
                value={newTrack.title}
                onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value.slice(0, 64) })}
                placeholder="Enter song title"
                className="bg-card/50 border-border"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={handleCloseAddModal}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAudio}
                disabled={!selectedAudioFile || !newTrack.title || uploading}
                className="flex-1 bg-primary/20 text-primary hover:bg-primary/30"
              >
                {uploading ? "Adding..." : "Apply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Music className="w-5 h-5" />
            Audio Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Your Audios section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Your Audios ({music.length}/3)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Audio
              </Button>
            </div>
            
            <div className="border border-border rounded-lg p-4 min-h-[100px]">
              {music.length > 0 ? (
                <div className="space-y-2">
                  {music.map((track) => (
                    <div key={track.id} className="flex items-center gap-3 bg-card/50 rounded p-2">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Music className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="flex-1 text-sm truncate">{track.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTrack(track.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <Music className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">You don't have any audio files yet.</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium notice */}
          <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm text-primary">
              With premium, you can upload up to 5 audio files. Upgrade now <span className="underline cursor-pointer">here</span>.
            </p>
          </div>

          {/* Audio Settings */}
          <div>
            <h3 className="text-sm font-medium mb-3">Audio Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-card/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Shuffle</span>
                </div>
                <Switch 
                  checked={audioShuffle} 
                  onCheckedChange={(checked) => onSettingsChange({ audio_shuffle: checked })} 
                />
              </div>
              
              <div className="flex items-center justify-between bg-card/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Player</span>
                </div>
                <Switch 
                  checked={showAudioPlayer ?? true} 
                  onCheckedChange={(checked) => onSettingsChange({ show_audio_player: checked })} 
                />
              </div>
              
              <div className="flex items-center justify-between bg-card/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Volume</span>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between bg-card/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Sticky (Below Profile)</span>
                </div>
                <Switch 
                  checked={audioSticky ?? false} 
                  onCheckedChange={(checked) => onSettingsChange({ audio_sticky: checked })} 
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioManager;
