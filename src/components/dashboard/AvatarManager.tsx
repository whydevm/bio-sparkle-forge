import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Image, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

interface AvatarManagerProps {
  open: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  discordAvatarEnabled?: boolean;
  discordAvatarUrl?: string;
  onDiscordSettingsChange?: (enabled: boolean, url: string) => void;
}

const AvatarManager = ({ 
  open, 
  onClose, 
  currentAvatar, 
  onAvatarChange,
  discordAvatarEnabled,
  discordAvatarUrl,
  onDiscordSettingsChange
}: AvatarManagerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Discord avatar override
  const [useDiscordAvatar, setUseDiscordAvatar] = useState(discordAvatarEnabled ?? false);
  const [discordUserId, setDiscordUserId] = useState("");
  const [fetchingDiscord, setFetchingDiscord] = useState(false);
  const [discordPreview, setDiscordPreview] = useState<string | null>(discordAvatarUrl || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setUseDiscordAvatar(discordAvatarEnabled ?? false);
    setDiscordPreview(discordAvatarUrl || null);
  }, [discordAvatarEnabled, discordAvatarUrl]);

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

  const fetchDiscordAvatar = async () => {
    if (!discordUserId.trim()) {
      toast.error("Please enter a Discord User ID");
      return;
    }

    setFetchingDiscord(true);
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
      if (!response.ok) throw new Error("User not found");
      
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch Discord user");

      const user = data.data.discord_user;
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

      setDiscordPreview(avatarUrl);
      toast.success(`Found: ${user.display_name || user.username}`);
    } catch (error) {
      toast.error("Could not find Discord user. Make sure they're using Lanyard.");
      setDiscordPreview(null);
    } finally {
      setFetchingDiscord(false);
    }
  };

  const saveDiscordAvatar = () => {
    if (discordPreview && onDiscordSettingsChange) {
      onDiscordSettingsChange(useDiscordAvatar, discordPreview);
      if (useDiscordAvatar) {
        onAvatarChange(discordPreview);
      }
      toast.success("Discord avatar settings saved!");
      handleClose();
    }
  };

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
      
      // Disable Discord avatar when uploading custom one
      if (onDiscordSettingsChange) {
        onDiscordSettingsChange(false, discordAvatarUrl || "");
      }
      
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
    setDiscordUserId("");
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            Choose Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload section */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[120px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {currentAvatar && !useDiscordAvatar ? (
              <img src={currentAvatar} alt="Current avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
            <span className="text-muted-foreground text-sm">Click or Drop an Avatar</span>
          </div>

          {/* Discord Avatar Override Section */}
          <div className="border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-[#5865F2]">
              <FaDiscord className="w-5 h-5" />
              <span className="font-medium">Discord Avatar Override</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="use-discord-avatar">Use Discord Avatar</Label>
              <Switch
                id="use-discord-avatar"
                checked={useDiscordAvatar}
                onCheckedChange={setUseDiscordAvatar}
              />
            </div>

            {useDiscordAvatar && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Discord User ID"
                    value={discordUserId}
                    onChange={(e) => setDiscordUserId(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={fetchDiscordAvatar}
                    disabled={fetchingDiscord}
                    size="sm"
                  >
                    {fetchingDiscord ? "..." : "Fetch"}
                  </Button>
                </div>
                
                {discordPreview && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={discordPreview}
                      alt="Discord avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Discord Avatar</p>
                      <p className="text-xs text-muted-foreground">Preview</p>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Your Discord user ID is required. The user must be using Lanyard for presence data.
                </p>
              </div>
            )}

            {discordPreview && useDiscordAvatar && (
              <Button
                onClick={saveDiscordAvatar}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
              >
                Save Discord Avatar
              </Button>
            )}
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarManager;
