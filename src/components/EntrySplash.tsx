import { useState } from "react";

interface EntrySplashProps {
  entryText: string;
  entryTextFont: string;
  onEnter: () => void;
  hasAudio?: boolean;
}

const EntrySplash = ({ entryText, entryTextFont, onEnter, hasAudio }: EntrySplashProps) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer transition-opacity duration-700 ease-out ${
        isEntering ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#000000" }}
    >
      <div className="text-center space-y-6 animate-fade-in pointer-events-none">
        <h1 className={`text-4xl font-bold text-white ${entryTextFont}`}>{entryText}</h1>
      </div>
    </div>
  );
};

export default EntrySplash;
