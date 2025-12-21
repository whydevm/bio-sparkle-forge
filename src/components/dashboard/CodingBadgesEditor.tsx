import { BADGE_CONFIG } from "@/components/profile/CodingBadges";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CodingBadgesEditorProps {
  selectedBadges: string[];
  onBadgesChange: (badges: string[]) => void;
}

const CodingBadgesEditor = ({ selectedBadges, onBadgesChange }: CodingBadgesEditorProps) => {
  const toggleBadge = (badgeKey: string) => {
    if (selectedBadges.includes(badgeKey)) {
      onBadgesChange(selectedBadges.filter((b) => b !== badgeKey));
    } else {
      onBadgesChange([...selectedBadges, badgeKey]);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Coding Badges</Label>
      <p className="text-sm text-muted-foreground">
        Select the technologies you work with to display on your profile
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(BADGE_CONFIG).map(([key, { label, Icon }]) => (
          <div
            key={key}
            onClick={() => toggleBadge(key)}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedBadges.includes(key)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Checkbox
              checked={selectedBadges.includes(key)}
              onCheckedChange={() => toggleBadge(key)}
            />
            <Icon className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodingBadgesEditor;