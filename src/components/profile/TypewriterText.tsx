import { useState, useEffect } from "react";

interface TypewriterTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  enableCycling?: boolean;
}

const TypewriterText = ({ 
  texts, 
  typingSpeed = 100, 
  deletingSpeed = 50,
  pauseDuration = 2500,
  className = "",
  enableCycling = true
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentFullText = texts[currentTextIndex] || "";
  const shouldCycle = enableCycling && texts.length > 1;

  useEffect(() => {
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        if (shouldCycle) {
          setIsDeleting(true);
        }
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting) {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setCurrentTextIndex(prev => (prev + 1) % texts.length);
      }
    } else {
      if (displayedText.length < currentFullText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else if (shouldCycle) {
        setIsPaused(true);
      }
    }
  }, [displayedText, isDeleting, isPaused, currentFullText, texts, typingSpeed, deletingSpeed, pauseDuration, shouldCycle]);

  return (
    <span className={className}>
      {displayedText}
    </span>
  );
};

export default TypewriterText;
