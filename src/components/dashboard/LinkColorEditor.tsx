import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Link {
  id: string;
  label: string;
  platform: string;
}

interface LinkColorEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: Link | null;
  currentColor: string;
  onSave: (linkId: string, color: string) => void;
}

const LinkColorEditor = ({ open, onOpenChange, link, currentColor, onSave }: LinkColorEditorProps) => {
  const [color, setColor] = useState(currentColor || "#ffffff");

  if (!link) return null;

  const handleSave = () => {
    onSave(link.id, color);
    onOpenChange(false);
  };

  const handleReset = () => {
    setColor("#ffffff");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Link Color</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Customize the color for "{link.label}"
        </p>
        <div className="space-y-4">
          <div>
            <Label>Link Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#5865F2"
                className="flex-1"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded border-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="text-primary">
              Reset to Default
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Color
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkColorEditor;