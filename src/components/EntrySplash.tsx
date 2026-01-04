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
    const isAnimated = emojiId.startsWith("a:");
    const cleanId = emojiId.replace(/^a?:/, "").split(":").pop() || emojiId;
    return `https://cdn.discordapp.com/emojis/${cleanId}.${isAnimated ? "gif" : "png"}?size=48`;
  };

  const renderContent = () => {
    const hasText = entryText && entryText.trim().length > 0;
    const hasEmoji = discordEmoji && discordEmoji.trim().length > 0;

    if (hasEmoji && !hasText) {
      return (
        <img 
          src={getEmojiUrl(discordEmoji)} 
          alt="Entry emoji" 
          className="w-12 h-12"
        />
      );
    }

    if (hasEmoji && hasText) {
      const emoji = <img src={getEmojiUrl(discordEmoji)} alt="" className="w-8 h-8 inline-block" />;
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

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer transition-all duration-500 ease-out ${
        isEntering && (!animation || animation === "none") ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
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
        {renderContent()}
      </div>
    </div>
  );
};

export default EntrySplash;
