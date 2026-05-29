import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

interface ScrollIndicatorProps {
  text?: string;
}

const ScrollIndicator = ({ text = "Scroll for more" }: ScrollIndicatorProps) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const fadeDistance = Math.max(window.innerHeight * 0.4, 200);
      const next = Math.max(0, 1 - y / fadeDistance);
      setOpacity(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const target = document.getElementById("about-section");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-2 cursor-pointer z-30 transition-opacity duration-500 ease-out"
      style={{ opacity, pointerEvents: opacity < 0.05 ? "none" : "auto" }}
      onClick={handleClick}
    >
      <span className="text-sm text-white/90 font-ggsans tracking-wide">{text}</span>
      <ArrowDown className="w-4 h-4 text-white/80 animate-bounce" />
    </div>
  );
};

export default ScrollIndicator;
