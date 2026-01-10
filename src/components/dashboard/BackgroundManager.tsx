import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image, Plus, X, Upload, Shuffle, Repeat, Clock, Trash2, Play, Eye, EyeOff } from "lucide-react";

interface Background {
  id: string;
  url: string;
  type: "image" | "video";
  enabled: boolean;
}

interface BackgroundManagerProps {
  open: boolean;
  onClose: () => void;
  currentBackground?: string;
  backgroundType?: string;
  backgrounds?: Background[];
  backgroundShuffle?: boolean;
  backgroundLoop?: boolean;
  backgroundDuration?: number;
  onBackgroundChange: (url: string, type: string) => void;
  onSettingsChange?: (settings: {
    backgrounds?: Background[];
    background_shuffle?: boolean;
    background_loop?: boolean;
    background_duration?: number;
  }) => void;
  isPremium?: boolean;
}

const BackgroundManager = ({ 
  open, 
  onClose, 
  currentBackground, 
  backgroundType,
  backgrounds = [],
  backgroundShuffle = false,
  backgroundLoop = true,
  backgroundDuration = 5,
  onBackgroundChange,
  onSettingsChange,
  isPremium = false
}: BackgroundManagerProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localBackgrounds, setLocalBackgrounds] = useState<Background[]>(backgrounds);
  const [shuffle, setShuffle] = useState(backgroundShuffle);
  const [loop, setLoop] = useState(backgroundLoop);
  const [duration, setDuration] = useState(backgroundDuration);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxBackgrounds = isPremium ? 3 : 1;

  useEffect(() => {
    setLocalBackgrounds(backgrounds);
    setShuffle(backgroundShuffle);
    setLoop(backgroundLoop);
    setDuration(backgroundDuration);
  }, [backgrounds, backgroundShuffle, backgroundLoop, backgroundDuration]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadBackground = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const isVideo = selectedFile.type.startsWith("video/");

      const { error: uploadError } = await supabase.storage
        .from("backgrounds")
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("backgrounds").getPublicUrl(fileName);
      
      const newBackground: Background = {
        id: Date.now().toString(),
        url: data.publicUrl,
        type: isVideo ? "video" : "image",
        enabled: true
      };

      const updatedBackgrounds = [...localBackgrounds, newBackground];
      setLocalBackgrounds(updatedBackgrounds);
      
      // Set as current if first background
      if (localBackgrounds.length === 0) {
        onBackgroundChange(data.publicUrl, isVideo ? "video" : "image");
      }
      
      onSettingsChange?.({ backgrounds: updatedBackgrounds });
      toast.success("Background uploaded!");
      handleCloseAddModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBackground = (id: string) => {
    const updatedBackgrounds = localBackgrounds.filter(bg => bg.id !== id);
    setLocalBackgrounds(updatedBackgrounds);
    onSettingsChange?.({ backgrounds: updatedBackgrounds });
    toast.success("Background removed");
  };

  const handleToggleBackground = (id: string) => {
    const updatedBackgrounds = localBackgrounds.map(bg =>
      bg.id === id ? { ...bg, enabled: !bg.enabled } : bg
    );
    setLocalBackgrounds(updatedBackgrounds);
    onSettingsChange?.({ backgrounds: updatedBackgrounds });
  };

  const handleSetActive = (bg: Background) => {
    onBackgroundChange(bg.url, bg.type);
    toast.success("Background set as active");
  };

  const handleShuffleChange = (checked: boolean) => {
    setShuffle(checked);
    onSettingsChange?.({ background_shuffle: checked });
  };

  const handleLoopChange = (checked: boolean) => {
    setLoop(checked);
    onSettingsChange?.({ background_loop: checked });
  };

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
    onSettingsChange?.({ background_duration: value[0] });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Add Background sub-modal
  if (showAddModal) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">Add New Background</DialogTitle>
                <p className="text-xs text-muted-foreground">Upload an image or video</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Background file drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors min-h-[140px] bg-background/50"
            >
              {previewUrl ? (
                selectedFile?.type.startsWith("video/") ? (
                  <video src={previewUrl} className="w-full h-28 object-cover rounded-lg" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-28 object-cover rounded-lg" />
                )
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click or drop to upload</span>
                  <span className="text-xs text-muted-foreground">Images & Videos</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleCloseAddModal} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={uploadBackground}
                disabled={!selectedFile || uploading}
                className="flex-1"
              >
                {uploading ? "Uploading..." : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Background Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Your Backgrounds section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Your Backgrounds ({localBackgrounds.length}/{maxBackgrounds})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                disabled={localBackgrounds.length >= maxBackgrounds}
                className="h-8 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
            
            {localBackgrounds.length > 0 ? (
              <div className="space-y-2">
                {localBackgrounds.map((bg) => (
                  <div key={bg.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border">
                    <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0">
                      {bg.type === "video" ? (
                        <video src={bg.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={bg.url} alt="Background" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{bg.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleBackground(bg.id)}
                        title={bg.enabled ? "Disable" : "Enable"}
                      >
                        {bg.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleSetActive(bg)}
                        title="Set as active"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteBackground(bg.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                <Image className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No backgrounds yet</span>
              </div>
            )}
          </div>

          {/* Premium notice */}
          {!isPremium && (
            <div className="border border-primary/30 bg-primary/5 rounded-lg p-3 text-center">
              <p className="text-xs text-primary">
                Premium users can upload up to 3 backgrounds
              </p>
            </div>
          )}

          {/* Settings */}
          {localBackgrounds.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Playback Settings</h3>
              
              {/* Shuffle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Shuffle</span>
                </div>
                <Switch checked={shuffle} onCheckedChange={handleShuffleChange} />
              </div>

              {/* Loop */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Loop</span>
                </div>
                <Switch checked={loop} onCheckedChange={handleLoopChange} />
              </div>

              {/* Duration for images */}
              <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Image Duration</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{duration}s</span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={handleDurationChange}
                  min={3}
                  max={30}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundManager;