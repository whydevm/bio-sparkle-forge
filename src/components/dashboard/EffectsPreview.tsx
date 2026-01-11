import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";

interface EffectsPreviewProps {
  effect: string;
}

const EffectsPreview = ({ effect }: EffectsPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderEffect = () => {
    switch (effect) {
      case "particles":
        return (
          <div className="relative w-full h-full overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </div>
        );
      case "snow":
        return (
          <div className="relative w-full h-full overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `fall ${3 + Math.random() * 4}s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.6 + 0.4,
                }}
              />
            ))}
            <style>{`
              @keyframes fall {
                0% { transform: translateY(-10px) rotate(0deg); }
                100% { transform: translateY(300px) rotate(360deg); }
              }
            `}</style>
          </div>
        );
      case "rain":
        return (
          <div className="relative w-full h-full overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-4 bg-blue-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `rain ${0.5 + Math.random() * 0.5}s linear infinite`,
                  animationDelay: `${Math.random() * 1}s`,
                  opacity: 0.4,
                }}
              />
            ))}
            <style>{`
              @keyframes rain {
                0% { transform: translateY(-20px); }
                100% { transform: translateY(300px); }
              }
            `}</style>
          </div>
        );
      case "oldtv":
        return (
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-0.5 bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No effect selected
          </div>
        );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        disabled={!effect || effect === "none"}
      >
        <Eye className="w-4 h-4" />
        Preview Effect
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Effect Preview: {effect || "None"}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-64 bg-black rounded-lg overflow-hidden">
            {renderEffect()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EffectsPreview;
