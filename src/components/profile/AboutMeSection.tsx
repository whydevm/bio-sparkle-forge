import { useEffect, useRef, useState } from "react";

interface AboutMeSectionProps {
  aboutMe: string;
  profileOpacity: number;
  profileBlur: number;
}

const AboutMeSection = ({ aboutMe, profileOpacity, profileBlur }: AboutMeSectionProps) => {
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
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
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
      className={`min-h-screen flex items-center justify-center p-8 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl text-center"
        style={{
          backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
          backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
          borderWidth: showBorder ? "1px" : "0",
          borderColor: showBorder ? "hsl(var(--border))" : "transparent",
        }}
      >
        <h2 className="text-3xl font-bold mb-6 font-mono">About Me</h2>
        <p className="text-muted-foreground leading-relaxed">{aboutMe}</p>
      </div>
    </div>
  );
};

export default AboutMeSection;
