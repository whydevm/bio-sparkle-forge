import { useState } from "react";

interface EntrySplashProps {
  entryText: string;
  entryTextFont: string;
  onEnter: () => void;
  hasAudio?: boolean;
  animation?: string;
  discordEmoji?: string;
  emojiPosition?: "start" | "end";
}

const EntrySplash = ({ 
  entryText, 
  entryTextFont, 
  onEnter, 
  hasAudio, 
  animation,
  discordEmoji,
  emojiPosition = "start"
}: EntrySplashProps) => {
  const [isEntering, setIsEntering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
      // Hide the splash screen after animation completes
      setTimeout(() => {
        setIsHidden(true);
      }, 100);
    }, animation && animation !== "none" ? 800 : 500);
  };

  // Don't render at all once hidden
  if (isHidden) return null;

  const getEmojiUrl = (emojiId: string) => {
    // Support both animated and static Discord emojis
    // Format: a:name:id for animated, name:id for static, or just id
    const isAnimated = emojiId.startsWith("a:");
    let cleanId = emojiId;
    
    if (emojiId.includes(":")) {
      const parts = emojiId.split(":");
      cleanId = parts[parts.length - 1];
    }
    
    // Remove any non-numeric characters except for the ID itself
    cleanId = cleanId.replace(/[^\d]/g, "");
    
    if (!cleanId) return null;
    
    return `https://cdn.discordapp.com/emojis/${cleanId}.${isAnimated ? "gif" : "png"}?size=48`;
  };

  const renderContent = () => {
    const hasText = entryText && entryText.trim().length > 0;
    const hasEmoji = discordEmoji && discordEmoji.trim().length > 0;
    const emojiUrl = hasEmoji ? getEmojiUrl(discordEmoji) : null;

    if (hasEmoji && emojiUrl && !hasText) {
      return (
        <img 
          src={emojiUrl} 
          alt="Entry emoji" 
          className="w-12 h-12"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    if (hasEmoji && emojiUrl && hasText) {
      const emoji = (
        <img 
          src={emojiUrl} 
          alt="" 
          className="w-8 h-8 inline-block"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
      return (
        <h1 className={`text-4xl font-bold text-white ${entryTextFont} flex items-center gap-3 justify-center`}>
          {emojiPosition === "start" && emoji}
          <span>{entryText}</span>
          {emojiPosition === "end" && emoji}
        </h1>
      );
    }

    return (
      <h1 className={`text-4xl font-bold text-white ${entryTextFont}`}>{entryText}</h1>
    );
  };

  const getAnimationContainerClass = () => {
    if (!isEntering) return "";
    if (!animation || animation === "none") return "animate-fade-out pointer-events-none";
    return "";
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer ${getAnimationContainerClass()}`}
      style={{ backgroundColor: "#000000" }}
    >
      {animation === "horizontal" && isEntering ? (
        <>
          <div 
            className="absolute inset-y-0 left-0 w-1/2 bg-black" 
            style={{ animation: "slide-left 0.8s ease-in-out forwards" }}
          />
          <div 
            className="absolute inset-y-0 right-0 w-1/2 bg-black"
            style={{ animation: "slide-right 0.8s ease-in-out forwards" }}
          />
        </>
      ) : animation === "vertical" && isEntering ? (
        <>
          <div 
            className="absolute inset-x-0 top-0 h-1/2 bg-black"
            style={{ animation: "slide-up 0.8s ease-in-out forwards" }}
          />
          <div 
            className="absolute inset-x-0 bottom-0 h-1/2 bg-black"
            style={{ animation: "slide-down 0.8s ease-in-out forwards" }}
          />
        </>
      ) : !isEntering ? (
        <div className="absolute inset-0 bg-black" />
      ) : null}
      
      <div className={`text-center space-y-6 animate-fade-in pointer-events-none transition-opacity duration-300 z-10 ${isEntering ? "opacity-0" : "opacity-100"}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default EntrySplash;