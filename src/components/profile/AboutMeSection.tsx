import { useEffect, useRef, useState } from "react";

interface AboutMeSectionProps {
  aboutMe: string;
  profileOpacity: number;
  profileBlur: number;
  titleColor?: string;
  textColor?: string;
}

const AboutMeSection = ({ aboutMe, profileOpacity, profileBlur, titleColor, textColor }: AboutMeSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      id="about-section"
      ref={sectionRef}
      className="flex items-center justify-center p-4 pt-8 pb-4"
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl text-center transition-all duration-700 ease-out ${
          isVisible 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-8 scale-75"
        }`}
        style={{
          backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
          backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
          borderWidth: showBorder ? "1px" : "0",
          borderColor: showBorder ? "hsl(var(--border))" : "transparent",
        }}
      >
        <h2 
          className="text-3xl font-bold mb-6 font-ggsans"
          style={{ color: titleColor || undefined }}
        >
          About Me
        </h2>
        <p 
          className="leading-relaxed"
          style={{ color: textColor || "hsl(var(--muted-foreground))" }}
        >
          {aboutMe}
        </p>
      </div>
    </div>
  );
};

export default AboutMeSection;
