import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image, Plus, X, Upload, Shuffle, Repeat, Clock, Trash2, Power, Download, ExternalLink, RotateCcw, Check } from "lucide-react";

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
  const [uploadTab, setUploadTab] = useState<"file" | "youtube">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localBackgrounds, setLocalBackgrounds] = useState<Background[]>(backgrounds);
  const [shuffle, setShuffle] = useState(backgroundShuffle);
  const [loop, setLoop] = useState(backgroundLoop);
  const [duration, setDuration] = useState(backgroundDuration);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxBackgrounds = isPremium ? 3 : 3; // Allow 3 for all users now

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
    setUploadTab("file");
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  // Add Background sub-modal
  if (showAddModal) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Add New Background</DialogTitle>
                <p className="text-sm text-muted-foreground">Upload a background file or search YouTube for videos</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Tab selector */}
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => setUploadTab("file")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  uploadTab === "file" 
                    ? "bg-primary/20 text-primary" 
                    : "bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setUploadTab("youtube")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  uploadTab === "youtube" 
                    ? "bg-primary/20 text-primary" 
                    : "bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </button>
            </div>

            {uploadTab === "file" && (
              <>
                <div className="text-sm font-medium">Background File</div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[180px] bg-background/50"
                >
                  {previewUrl ? (
                    selectedFile?.type.startsWith("video/") ? (
                      <video src={previewUrl} className="w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    )
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Image className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">Click or Drop a Background File</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}

            {uploadTab === "youtube" && (
              <div className="text-center text-muted-foreground py-8">
                YouTube integration coming soon
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={handleCloseAddModal} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={uploadBackground}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
              >
                {uploading ? "Uploading..." : "Add Background"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Image className="w-5 h-5" />
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
                className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Background
              </Button>
            </div>
            
            {localBackgrounds.length > 0 ? (
              <div className="space-y-3">
                {localBackgrounds.map((bg) => (
                  <div key={bg.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border">
                    {/* Drag handle */}
                    <div className="flex flex-col gap-0.5 text-muted-foreground cursor-grab">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                      {bg.type === "video" ? (
                        <video src={bg.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={bg.url} alt="Background" className="w-full h-full object-cover" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{bg.type === "video" ? "Video Background" : "Image Background"}</p>
                      <a 
                        href={bg.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View on Platform
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownload(bg.url)}
                        className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBackground(bg.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          bg.enabled 
                            ? "bg-primary/20 text-primary hover:bg-primary/30" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        title={bg.enabled ? "Disable" : "Enable"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackground(bg.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2">
                <Image className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No backgrounds yet</span>
              </div>
            )}
          </div>

          {/* Settings */}
          {localBackgrounds.length > 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Shuffle */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Shuffle</h3>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                    <div className="flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Enable Shuffle</span>
                    </div>
                    <Switch 
                      checked={shuffle} 
                      onCheckedChange={handleShuffleChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>

                {/* Loop */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Loop</h3>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Enable Loop</span>
                    </div>
                    <Switch 
                      checked={loop} 
                      onCheckedChange={handleLoopChange}
                    />
                  </div>
                </div>
              </div>

              {/* Duration for images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Image Duration (Seconds)</h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDuration(5)}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onSettingsChange?.({ background_duration: duration })}
                      className="w-7 h-7 rounded-lg bg-primary/20 hover:bg-primary/30 flex items-center justify-center"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-background/50 border border-border">
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundManager;