import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  text?: string;
}

const ScrollIndicator = ({ text = "scroll for more" }: ScrollIndicatorProps) => {
  const handleClick = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div 
      className="flex flex-col items-center gap-3 cursor-pointer mt-10 animate-fade-in"
      onClick={handleClick}
    >
      <ChevronDown className="w-8 h-8 text-white/80 animate-bounce" />
      <span className="text-base text-white/80 font-mono tracking-wide">{text}</span>
    </div>
  );
};

export default ScrollIndicator;
