import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image, Plus, X, Upload, Youtube, Shuffle, Repeat, Check, RotateCcw } from "lucide-react";

interface BackgroundManagerProps {
  open: boolean;
  onClose: () => void;
  currentBackground?: string;
  backgroundType?: string;
  onBackgroundChange: (url: string, type: string) => void;
}

const BackgroundManager = ({ 
  open, 
  onClose, 
  currentBackground, 
  backgroundType,
  onBackgroundChange 
}: BackgroundManagerProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [enableShuffle, setEnableShuffle] = useState(false);
  const [enableLoop, setEnableLoop] = useState(true);
  const [imageDuration, setImageDuration] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onBackgroundChange(data.publicUrl, isVideo ? "video" : "image");
      toast.success("Background uploaded!");
      setShowAddModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
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
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Image className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <DialogTitle className="text-lg">Add New Background</DialogTitle>
                <p className="text-sm text-muted-foreground">Upload a background file or search YouTube for videos</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Upload options */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                disabled
              >
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Background file drop zone */}
            <div>
              <label className="text-sm font-medium">Background File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-2 border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors min-h-[160px]"
              >
                {previewUrl ? (
                  selectedFile?.type.startsWith("video/") ? (
                    <video src={previewUrl} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded" />
                  )
                ) : (
                  <>
                    <Image className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click or Drop a Background File</span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={handleCloseAddModal}>
                Cancel
              </Button>
              <Button
                onClick={uploadBackground}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-primary/20 text-primary hover:bg-primary/30"
              >
                {uploading ? "Adding..." : "Add Background"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Image className="w-5 h-5" />
            Background Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Your Backgrounds section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Your Backgrounds (0/1)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Background
              </Button>
            </div>
            
            <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 min-h-[100px]">
              {currentBackground ? (
                backgroundType === "video" ? (
                  <video src={currentBackground} className="w-full h-20 object-cover rounded" />
                ) : (
                  <img src={currentBackground} alt="Current" className="w-full h-20 object-cover rounded" />
                )
              ) : (
                <>
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">You don't have any background files yet.</span>
                </>
              )}
            </div>
          </div>

          {/* Premium notice */}
          <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm text-primary">
              With premium, you can upload up to 3 backgrounds. Upgrade now <span className="underline cursor-pointer">here</span>.
            </p>
          </div>

          {/* Shuffle section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Shuffle</h3>
            <div className="flex items-center justify-between bg-card/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Enable Shuffle</span>
              </div>
              <Switch checked={enableShuffle} onCheckedChange={setEnableShuffle} />
            </div>
          </div>

          {/* Loop section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Loop</h3>
            <div className="flex items-center justify-between bg-card/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Enable Loop</span>
              </div>
              <Switch checked={enableLoop} onCheckedChange={setEnableLoop} />
            </div>
          </div>

          {/* Image Duration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Image Duration (Seconds)</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-muted rounded">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-muted rounded">
                  <Check className="w-4 h-4 text-green-500" />
                </button>
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-lg p-3">
              <Slider
                value={[imageDuration]}
                onValueChange={([value]) => setImageDuration(value)}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundManager;
