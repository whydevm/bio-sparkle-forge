import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Image, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

interface AvatarManagerProps {
  open: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
}

const AvatarManager = ({ open, onClose, currentAvatar, onAvatarChange }: AvatarManagerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsEditing(true);
      setZoom(100);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsEditing(true);
      setZoom(100);
    }
  }, []);

  const resetZoom = () => setZoom(100);

  const uploadAvatar = async (skipEdit: boolean = false) => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      onAvatarChange(data.publicUrl);
      toast.success("Avatar uploaded!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setZoom(100);
    onClose();
  };

  const handleSkipEditing = () => uploadAvatar(true);
  const handleSaveChanges = () => uploadAvatar(false);

  if (isEditing && previewUrl) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Image className="w-5 h-5" />
              Edit Image
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative bg-card/50 border border-border rounded-lg p-4 flex items-center justify-center overflow-hidden">
              <div className="relative w-64 h-64">
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-muted-foreground/20" />
                    ))}
                  </div>
                </div>
                
                {/* Circular mask */}
                <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-primary">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-4 bg-card/50 border border-border rounded-lg p-3">
              <ZoomOut className="w-5 h-5 text-muted-foreground" />
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={50}
                max={200}
                step={1}
                className="flex-1"
              />
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium min-w-[48px]">{zoom}%</span>
              <button onClick={resetZoom} className="p-1 hover:bg-muted rounded">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipEditing}
                disabled={uploading}
                className="flex-1"
              >
                Skip Editing
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={uploading}
                className="flex-1 bg-primary/20 text-primary hover:bg-primary/30"
              >
                {uploading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[160px]"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {currentAvatar ? (
        <img src={currentAvatar} alt="Current avatar" className="w-16 h-16 rounded-full object-cover" />
      ) : (
        <User className="w-12 h-12 text-muted-foreground" />
      )}
      <span className="text-muted-foreground text-sm">Click or Drop a Avatar</span>
      
      {isEditing && (
        <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
          <DialogContent className="max-w-md">
            {/* Edit dialog content handled above */}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AvatarManager;
