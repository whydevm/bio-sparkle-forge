import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Volume2, Upload, Trash2, Play } from "lucide-react";

interface ClickSoundManagerProps {
  enabled: boolean;
  soundUrl: string | null;
  onSettingsChange: (settings: { click_sounds?: boolean; click_sound_url?: string | null }) => void;
}

const ClickSoundManager = ({ enabled, soundUrl, onSettingsChange }: ClickSoundManagerProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("audio")) {
      toast.error("Please upload an audio file");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/click-sound-${Date.now()}.mp3`;
      const { error } = await supabase.storage
        .from("music")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("music").getPublicUrl(fileName);
      onSettingsChange({ click_sound_url: data.publicUrl });
      toast.success("Click sound uploaded!");
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const playPreview = () => {
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 0.3;
      audio.play();
    }
  };

  return (
    <div className="space-y-4 border border-border rounded-xl p-4 bg-card/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <Label className="font-semibold">Click Sounds</Label>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => onSettingsChange({ click_sounds: checked })}
        />
      </div>

      {enabled && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Upload a custom MP3 to play on every click
          </p>

          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="audio/mp3,audio/mpeg,audio/*"
              onChange={handleUpload}
              className="hidden"
              id="click-sound-upload-manager"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("click-sound-upload-manager")?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : soundUrl ? "Change Sound" : "Upload MP3"}
            </Button>

            {soundUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playPreview}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSettingsChange({ click_sound_url: null })}
                  className="text-destructive gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </>
            )}
          </div>

          {soundUrl && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Custom sound active
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClickSoundManager;
