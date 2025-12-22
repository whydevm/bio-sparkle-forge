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

  // Group badges by category
  const categories = Object.entries(BADGE_CONFIG).reduce((acc, [key, config]) => {
    const category = config.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, ...config });
    return acc;
  }, {} as Record<string, Array<{ key: string; label: string; Icon: React.ElementType; url: string; category: string }>>);

  const categoryOrder = ["Frontend", "Backend", "Core", "Database", "Cloud", "Tools", "Mobile", "Design", "Game"];

  return (
    <div className="space-y-6">
      {categoryOrder.map((categoryName) => {
        const badges = categories[categoryName];
        if (!badges || badges.length === 0) return null;

        return (
          <div key={categoryName} className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {categoryName}
            </Label>
            <div className="flex flex-wrap gap-2">
              {badges.map(({ key, label, Icon }) => (
                <div
                  key={key}
                  onClick={() => toggleBadge(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedBadges.includes(key)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedBadges.includes(key)}
                    onCheckedChange={() => toggleBadge(key)}
                    className="w-3.5 h-3.5"
                  />
                  <Icon className="w-4 h-4 text-foreground" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CodingBadgesEditor;