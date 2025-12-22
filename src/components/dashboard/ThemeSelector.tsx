import { Label } from "@/components/ui/label";

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  {
    id: "default",
    name: "Default",
    preview: {
      bg: "bg-card",
      accent: "bg-muted",
      text: "bg-foreground/60",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    preview: {
      bg: "bg-background",
      accent: "bg-muted/50",
      text: "bg-foreground/40",
    },
  },
  {
    id: "neon",
    name: "Neon",
    preview: {
      bg: "bg-black",
      accent: "bg-primary",
      text: "bg-primary/60",
    },
  },
];

const ThemeSelector = ({ selectedTheme, onThemeChange }: ThemeSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Theme Selection</Label>
      
      <div className="space-y-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTheme === theme.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{theme.name}</span>
              {selectedTheme === theme.id && (
                <span className="text-xs text-primary">Selected</span>
              )}
            </div>
            
            {/* Theme preview */}
            <div className={`${theme.preview.bg} rounded-lg p-4 border border-border/50`}>
              <div className="flex flex-col items-center gap-2">
                {/* Avatar placeholder */}
                <div className={`w-10 h-10 rounded-full ${theme.preview.accent}`} />
                {/* Name placeholder */}
                <div className={`w-20 h-3 rounded ${theme.preview.text}`} />
                {/* Bio placeholder */}
                <div className={`w-32 h-2 rounded ${theme.preview.text} opacity-60`} />
                {/* Social links placeholder */}
                <div className={`w-full h-8 rounded-lg ${theme.preview.accent} mt-2`}>
                  <div className="flex items-center justify-center h-full gap-2">
                    <div className={`w-5 h-5 rounded-full ${theme.preview.text}`} />
                    <div className={`w-16 h-2 rounded ${theme.preview.text}`} />
                  </div>
                </div>
                {/* Badges placeholder */}
                <div className="flex gap-1 mt-1">
                  <div className={`w-6 h-6 rounded-full ${theme.preview.accent}`} />
                  <div className={`w-6 h-6 rounded-full ${theme.preview.accent}`} />
                  <div className={`w-6 h-6 rounded-full ${theme.preview.accent}`} />
                </div>
                {/* Scroll indicator placeholder */}
                <div className={`w-1 h-4 rounded-full ${theme.preview.text} mt-1`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;