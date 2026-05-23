import { useEffect, useRef, useState } from "react";

interface AboutMeSectionProps {
  aboutMe: string;
  profileOpacity: number;
  profileBlur: number;
  titleColor?: string;
  textColor?: string;
  description?: string;
  globalRadius?: number;
}

const AboutMeSection = ({ 
  aboutMe, 
  profileOpacity, 
  profileBlur, 
  titleColor, 
  textColor,
  description,
  globalRadius = 50,
}: AboutMeSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px 0px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const showBorder = profileOpacity > 0;

  // Parse about me text with markdown-like formatting
  const parseAboutMe = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle emoji bullets
      if (line.match(/^[🌏🔧🚀❄️📁💬💼🎨✨🎮💻🎵📱🌐⚡️🔥💡🎯]/)) {
        return (
          <p key={index} className="flex items-start gap-2 mt-2">
            <span className="flex-shrink-0">{line.charAt(0)}</span>
            <span>{line.slice(1).trim()}</span>
          </p>
        );
      }
      // Handle quoted text
      if (line.startsWith('"') || line.startsWith("'")) {
        return (
          <p key={index} className="italic text-white/60 mt-4">
            {line}
          </p>
        );
      }
      // Regular paragraph
      if (line.trim()) {
        return <p key={index} className="mt-2">{line}</p>;
      }
      return null;
    });
  };

  return (
    <div
      id="about-section"
      ref={sectionRef}
      className="flex flex-col items-center justify-center p-4 pt-8 pb-4"
    >
      {/* Header above the card */}
      <div
        className={`w-full max-w-2xl text-center mb-4 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h2
          className="text-3xl font-bold mb-2 font-ggsans"
          style={{ color: titleColor || undefined }}
        >
          About Me
        </h2>
        {description && (
          <p
            className="text-sm font-ggsans"
            style={{ color: textColor || "hsl(var(--muted-foreground))" }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Card with body text */}
      <div
        className={`w-full max-w-2xl p-6 text-center transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{
          backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
          backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
          borderWidth: showBorder ? "1px" : "0",
          borderColor: showBorder ? "hsl(var(--border))" : "transparent",
          borderRadius,
        }}
      >
        <div
          className="leading-relaxed text-center font-ggsans"
          style={{ color: textColor || "hsl(var(--muted-foreground))" }}
        >
          {parseAboutMe(aboutMe)}
        </div>
      </div>
    </div>
  );
};

export default AboutMeSection;
