import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Image, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

interface AvatarManagerProps {
  open: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  discordUserId?: string;
  discordAvatarSync?: boolean;
  discordDecorationSync?: boolean;
  onDiscordAvatarSyncChange?: (enabled: boolean) => void;
  onDiscordDecorationSyncChange?: (enabled: boolean) => void;
}

interface DiscordPresenceData {
  discord_user: {
    id: string;
    avatar: string;
    avatar_decoration_data?: {
      asset: string;
      sku_id?: string;
    };
  };
}

const AvatarManager = ({ 
  open, 
  onClose, 
  currentAvatar, 
  onAvatarChange,
  discordUserId,
  discordAvatarSync = false,
  discordDecorationSync = false,
  onDiscordAvatarSyncChange,
  onDiscordDecorationSyncChange,
}: AvatarManagerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [discordAvatar, setDiscordAvatar] = useState<string | null>(null);
  const [discordDecoration, setDiscordDecoration] = useState<string | null>(null);
  const [loadingDiscord, setLoadingDiscord] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Discord avatar when dialog opens
  useEffect(() => {
    const fetchDiscordInfo = async () => {
      if (!discordUserId || !open) return;
      
      setLoadingDiscord(true);
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const user = data.data.discord_user;
            const avatarUrl = user.avatar
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=256`
              : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || "0") % 5}.png`;
            
            setDiscordAvatar(avatarUrl);
            
            if (user.avatar_decoration_data?.asset) {
              const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=160&passthrough=true`;
              setDiscordDecoration(decorationUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching Discord info:", error);
      } finally {
        setLoadingDiscord(false);
      }
    };

    fetchDiscordInfo();
  }, [discordUserId, open]);

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

  const uploadAvatar = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const handleSyncDiscordAvatar = () => {
    if (discordAvatar) {
      onAvatarChange(discordAvatar);
      onDiscordAvatarSyncChange?.(true);
      toast.success("Discord avatar synced!");
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setZoom(100);
    onClose();
  };

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
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-muted-foreground/20" />
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              </div>
            </div>

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

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleClose} disabled={uploading} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={uploadAvatar}
                disabled={uploading}
                className="flex-1 bg-primary/20 text-primary hover:bg-primary/30"
              >
                {uploading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            Avatar Manager
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload and manage your avatar. You can upload a custom avatar or sync your Discord avatar.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Custom Avatar */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Custom Avatar</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="relative border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors aspect-square"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {currentAvatar && !discordAvatarSync ? (
                  <img src={currentAvatar} alt="Current avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-card/50">
                    <User className="w-12 h-12 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">Click or drop to upload</span>
                  </div>
                )}
                
                {currentAvatar && !discordAvatarSync && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    PNG
                  </div>
                )}
              </div>
            </div>

            {/* Discord Avatar */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Discord Avatar</Label>
              <div className="relative border border-border rounded-xl overflow-hidden aspect-square">
                {loadingDiscord ? (
                  <div className="w-full h-full flex items-center justify-center bg-card/50">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : discordAvatar ? (
                  <img src={discordAvatar} alt="Discord avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-card/50">
                    <FaDiscord className="w-12 h-12 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      {discordUserId ? "Unable to load" : "Add Discord ID to social cards"}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Sync Discord Avatar Button */}
              {discordAvatar && (
                <Button
                  onClick={handleSyncDiscordAvatar}
                  className="w-full mt-2 bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 border border-[#5865F2]/30"
                  variant="outline"
                >
                  <FaDiscord className="w-4 h-4 mr-2" />
                  Sync Discord Avatar
                </Button>
              )}
            </div>
          </div>

          {/* Discord Decoration Sync */}
          {discordDecoration && (
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card/50">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="w-full h-full rounded-full bg-muted" />
                  <img 
                    src={discordDecoration} 
                    alt="Discord decoration" 
                    className="absolute pointer-events-none"
                    style={{
                      width: '140%',
                      height: '140%',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Sync Discord Decoration</Label>
                  <p className="text-xs text-muted-foreground">Use your Discord avatar decoration on your profile</p>
                </div>
              </div>
              <Switch
                checked={discordDecorationSync}
                onCheckedChange={onDiscordDecorationSyncChange}
              />
            </div>
          )}

          <Button variant="outline" onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarManager;
