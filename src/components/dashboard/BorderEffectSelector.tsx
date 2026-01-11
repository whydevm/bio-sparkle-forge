import { Label } from "@/components/ui/label";

interface BorderEffectSelectorProps {
  selectedEffect: string;
  onEffectChange: (effect: string) => void;
}

const effects = [
  {
    id: "default",
    name: "Default",
    description: "Standard solid border",
    preview: "border-2 border-foreground/30",
  },
  {
    id: "glass",
    name: "Glass",
    description: "Animated glowing border that trails around",
    preview: "glass-border-effect-mini",
  },
  {
    id: "glow",
    name: "Glow",
    description: "Static glowing border",
    preview: "border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]",
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Gradient colored border",
    preview: "border-2 border-transparent bg-gradient-to-r from-primary to-accent bg-clip-border",
  },
];

const BorderEffectSelector = ({ selectedEffect, onEffectChange }: BorderEffectSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Border Effect</Label>
      
      <div className="grid grid-cols-2 gap-3">
        {effects.map((effect) => (
          <div
            key={effect.id}
            onClick={() => onEffectChange(effect.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedEffect === effect.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className={`w-8 h-8 rounded ${effect.preview} bg-card`}
              />
              <span className="font-medium text-sm">{effect.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{effect.description}</p>
          </div>
        ))}
      </div>

      <style>{`
        .glass-border-effect-mini {
          position: relative;
          overflow: hidden;
          border-radius: 0.5rem;
        }
        .glass-border-effect-mini::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: conic-gradient(
            from 0deg,
            transparent,
            hsl(var(--primary) / 0.8),
            transparent,
            transparent,
            transparent
          );
          animation: rotate-mini 2s linear infinite;
          border-radius: inherit;
        }
        .glass-border-effect-mini::after {
          content: '';
          position: absolute;
          inset: 2px;
          background: hsl(var(--card));
          border-radius: inherit;
        }
        @keyframes rotate-mini {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BorderEffectSelector;
