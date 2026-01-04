import { useState } from "react";

interface EntrySplashProps {
  entryText: string;
  entryTextFont: string;
  onEnter: () => void;
  hasAudio?: boolean;
  animation?: string;
}

const EntrySplash = ({ entryText, entryTextFont, onEnter, hasAudio, animation }: EntrySplashProps) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  const getAnimationClass = () => {
    if (!isEntering) return "";
    if (animation === "horizontal") return "animate-split-horizontal";
    if (animation === "vertical") return "animate-split-vertical";
    return "opacity-0";
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer transition-all duration-700 ease-out ${
        isEntering && !animation ? "opacity-0" : "opacity-100"
      } ${getAnimationClass()}`}
      style={{ backgroundColor: "#000000" }}
    >
      {animation === "horizontal" && isEntering ? (
        <>
          <div className="absolute inset-0 w-1/2 left-0 bg-black animate-slide-left" />
          <div className="absolute inset-0 w-1/2 right-0 left-1/2 bg-black animate-slide-right" />
        </>
      ) : animation === "vertical" && isEntering ? (
        <>
          <div className="absolute inset-0 h-1/2 top-0 bg-black animate-slide-up" />
          <div className="absolute inset-0 h-1/2 bottom-0 top-1/2 bg-black animate-slide-down" />
        </>
      ) : null}
      
      <div className={`text-center space-y-6 animate-fade-in pointer-events-none transition-opacity duration-300 ${isEntering ? "opacity-0" : "opacity-100"}`}>
        <h1 className={`text-4xl font-bold text-white ${entryTextFont}`}>{entryText}</h1>
      </div>
    </div>
  );
};

export default EntrySplash;
