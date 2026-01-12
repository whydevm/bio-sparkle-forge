import { useState } from "react";

interface EntrySplashProps {
  entryText: string;
  entryTextFont: string;
  onEnter: () => void;
  hasAudio?: boolean;
  animation?: string;
  discordEmoji?: string;
  emojiPosition?: "start" | "end";
  backgroundUrl?: string;
  backgroundType?: string;
}

const EntrySplash = ({ 
  entryText, 
  entryTextFont, 
  onEnter, 
  hasAudio, 
  animation,
  discordEmoji,
  emojiPosition = "start",
  backgroundUrl,
  backgroundType
}: EntrySplashProps) => {
  const [isEntering, setIsEntering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
      setTimeout(() => {
        setIsHidden(true);
      }, 100);
    }, animation && animation !== "none" ? 800 : 500);
  };

  if (isHidden) return null;

  const getEmojiUrl = (emojiId: string) => {
    if (!emojiId) return null;
    
    let isAnimated = false;
    let cleanId = emojiId.trim();
    
    cleanId = cleanId.replace(/^<|>$/g, "");
    
    if (cleanId.startsWith("a:")) {
      isAnimated = true;
      cleanId = cleanId.slice(2);
    }
    
    if (cleanId.includes(":")) {
      const parts = cleanId.split(":");
      cleanId = parts[parts.length - 1];
    }
    
    cleanId = cleanId.replace(/[^\d]/g, "");
    
    if (!cleanId || cleanId.length < 15) return null;
    
    return `https://cdn.discordapp.com/emojis/${cleanId}.${isAnimated ? "gif" : "png"}?size=64`;
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

  const renderBackground = () => {
    if (!backgroundUrl) {
      return <div className="absolute inset-0 bg-black" />;
    }

    if (backgroundType === "video") {
      return (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      );
    }

    return (
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
    );
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer ${getAnimationContainerClass()}`}
    >
      {/* Background */}
      {!isEntering && renderBackground()}
      
      {/* Dark overlay for readability */}
      {!isEntering && backgroundUrl && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* Split animations */}
      {animation === "horizontal" && isEntering && (
        <>
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{ animation: "slide-left 0.8s ease-in-out forwards" }}
            >
              {renderBackground()}
              {backgroundUrl && <div className="absolute inset-0 bg-black/50" />}
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
            <div 
              className="absolute inset-0 -left-full"
              style={{ animation: "slide-right 0.8s ease-in-out forwards" }}
            >
              {renderBackground()}
              {backgroundUrl && <div className="absolute inset-0 bg-black/50" />}
            </div>
          </div>
        </>
      )}
      
      {animation === "vertical" && isEntering && (
        <>
          <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{ animation: "slide-up 0.8s ease-in-out forwards" }}
            >
              {renderBackground()}
              {backgroundUrl && <div className="absolute inset-0 bg-black/50" />}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
            <div 
              className="absolute inset-0 -top-full"
              style={{ animation: "slide-down 0.8s ease-in-out forwards" }}
            >
              {renderBackground()}
              {backgroundUrl && <div className="absolute inset-0 bg-black/50" />}
            </div>
          </div>
        </>
      )}
      
      {/* Entry content */}
      <div className={`text-center space-y-6 animate-fade-in pointer-events-none transition-opacity duration-300 z-10 ${isEntering ? "opacity-0" : "opacity-100"}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default EntrySplash;
