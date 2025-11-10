import { useState } from "react";

interface EntrySplashProps {
  entryText: string;
  entryTextFont: string;
  onEnter: () => void;
}

const EntrySplash = ({ entryText, entryTextFont, onEnter }: EntrySplashProps) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 300);
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 cursor-pointer ${
        isEntering ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-6 animate-fade-in pointer-events-none">
        <h1 className={`text-4xl font-bold ${entryTextFont}`}>{entryText}</h1>
      </div>
    </div>
  );
};

export default EntrySplash;
