import { useEffect, useState } from "react";

interface ProfileUsernameProps {
  username: string;
  effect?: string;
  glow?: boolean;
}

const ProfileUsername = ({ username, effect, glow }: ProfileUsernameProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (effect === "typewriter") {
      if (currentIndex < username.length) {
        const timeout = setTimeout(() => {
          setDisplayText(username.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, 100);
        return () => clearTimeout(timeout);
      }
    } else {
      setDisplayText(username);
    }
  }, [currentIndex, username, effect]);

  const getEffectClass = () => {
    if (effect === "rainbow") return "animate-rainbow";
    if (effect === "sparkles") return "animate-sparkle";
    return "";
  };

  const getGradientClass = () => {
    if (effect === "yellow-red") return "bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent";
    if (effect === "blue-purple") return "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent";
    if (effect === "pink-orange") return "bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent";
    return "";
  };

  return (
    <h1
      className={`text-3xl font-bold ${glow ? "glow-text" : ""} ${getEffectClass()} ${getGradientClass()}`}
    >
      {displayText}
      {effect === "typewriter" && currentIndex < username.length && (
        <span className="animate-pulse">|</span>
      )}
    </h1>
  );
};

export default ProfileUsername;