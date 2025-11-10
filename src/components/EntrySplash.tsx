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
        {hasAudio && (
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-primary animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
        <h1 className={`text-4xl font-bold ${entryTextFont}`}>{entryText}</h1>
      </div>
    </div>
  );
};

export default EntrySplash;
