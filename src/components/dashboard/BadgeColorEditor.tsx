import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Wrench, Star, Shield, Gift, Bug, Check, Trophy, Medal, Sparkles, Zap, Heart, Diamond } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  badge_type: string;
}

interface BadgeColorEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge | null;
  currentColor: string;
  onSave: (badgeId: string, color: string) => void;
}

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  owner: Crown,
  manager: Wrench,
  staff: Star,
  helper: Shield,
  og: Sparkles,
  verified: Check,
  premium: Zap,
  donor: Heart,
  gifter: Gift,
  bug_hunter: Bug,
  winner: Trophy,
  second_place: Medal,
  third_place: Medal,
  server_booster: Zap,
  million: Diamond,
  domain_legend: Shield,
  image_host: Shield,
  christmas_2024: Sparkles,
  easter_2025: Sparkles,
};

const BadgeColorEditor = ({ open, onOpenChange, badge, currentColor, onSave }: BadgeColorEditorProps) => {
  const [color, setColor] = useState(currentColor || "#ffffff");

  if (!badge) return null;

  const IconComponent = BADGE_ICONS[badge.badge_type] || Star;

  const handleSave = () => {
    onSave(badge.id, color);
    onOpenChange(false);
  };

  const handleReset = () => {
    setColor("#ffffff");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Badge Color</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Badge</Label>
            <div className="bg-muted rounded-lg p-3 flex items-center gap-3 mt-1">
              <IconComponent className="w-6 h-6" style={{ color }} />
              <span>{badge.name}</span>
            </div>
          </div>
          <div>
            <Label>Badge Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#1cd803"
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

export default BadgeColorEditor;