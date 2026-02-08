import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MousePointer, Hand, Trash2 } from "lucide-react";

interface CursorManagerProps {
  open: boolean;
  onClose: () => void;
  currentCursor?: string;
  onCursorChange: (url: string | null) => void;
  trailingEnabled?: boolean;
  onTrailingChange?: (enabled: boolean) => void;
  trailCount?: number;
  onTrailCountChange?: (count: number) => void;
}

const CursorManager = ({ 
  open, 
  onClose, 
  currentCursor,
  onCursorChange,
  trailingEnabled = false,
  onTrailingChange,
  trailCount = 8,
  onTrailCountChange,
}: CursorManagerProps) => {
  const [regularCursor, setRegularCursor] = useState<string | null>(currentCursor || null);
  const [pointerCursor, setPointerCursor] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const regularInputRef = useRef<HTMLInputElement>(null);
  const pointerInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: "regular" | "pointer") => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("cursors")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("cursors").getPublicUrl(fileName);
      
      if (type === "regular") {
        setRegularCursor(data.publicUrl);
        onCursorChange(data.publicUrl);
      } else {
        setPointerCursor(data.publicUrl);
      }
      
      toast.success("Cursor uploaded!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRegularFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, "regular");
  };

  const handlePointerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, "pointer");
  };

  const handleRemoveCursor = (type: "regular" | "pointer") => {
    if (type === "regular") {
      setRegularCursor(null);
      onCursorChange(null);
    } else {
      setPointerCursor(null);
    }
    toast.success("Cursor removed");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-lg">Cursor Manager</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Upload and manage your custom cursors.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Regular Cursor */}
          <div>
            <label className="text-sm font-medium">Regular Cursor</label>
            <div className="mt-2 relative">
              <div
                onClick={() => regularInputRef.current?.click()}
                className="border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors min-h-[140px]"
              >
                {regularCursor ? (
                  <div className="relative">
                    <img src={regularCursor} alt="Regular cursor" className="w-12 h-12 object-contain" />
                  </div>
                ) : (
                  <>
                    <MousePointer className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click or Drop a Cursor File</span>
                  </>
                )}
              </div>
              {regularCursor && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCursor("regular");
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive/20 rounded hover:bg-destructive/40"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              )}
              <input
                ref={regularInputRef}
                type="file"
                accept="image/*"
                onChange={handleRegularFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Pointer Cursor */}
          <div>
            <label className="text-sm font-medium">Pointer Cursor</label>
            <div className="mt-2 relative">
              <div
                onClick={() => pointerInputRef.current?.click()}
                className="border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors min-h-[140px]"
              >
                {pointerCursor ? (
                  <img src={pointerCursor} alt="Pointer cursor" className="w-12 h-12 object-contain" />
                ) : (
                  <>
                    <Hand className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click or Drop a Pointer Cursor File</span>
                  </>
                )}
              </div>
              {pointerCursor && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCursor("pointer");
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive/20 rounded hover:bg-destructive/40"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              )}
              <input
                ref={pointerInputRef}
                type="file"
                accept="image/*"
                onChange={handlePointerFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Trailing Effect Option */}
          {regularCursor && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Cursor Trail Effect</Label>
                  <p className="text-xs text-muted-foreground">Multiple cursors follow your main cursor</p>
                </div>
                <Switch
                  checked={trailingEnabled}
                  onCheckedChange={onTrailingChange}
                />
              </div>

              {trailingEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Trail Length</Label>
                    <span className="text-sm text-muted-foreground">{trailCount}</span>
                  </div>
                  <Slider
                    value={[trailCount]}
                    onValueChange={([val]) => onTrailCountChange?.(val)}
                    min={3}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CursorManager;
