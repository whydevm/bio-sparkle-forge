import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EntrySplashProps {
  entryText: string;
  onEnter: () => void;
}

const EntrySplash = ({ entryText, onEnter }: EntrySplashProps) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        isEntering ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-6 animate-fade-in">
        <h1 className="text-4xl font-bold glow-text">{entryText}</h1>
        <Button onClick={handleEnter} size="lg" className="glow-border">
          Enter
        </Button>
      </div>
    </div>
  );
};

export default EntrySplash;
