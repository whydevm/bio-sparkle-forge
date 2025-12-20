import { ChevronDown } from "lucide-react";

const ScrollIndicator = () => {
  const handleClick = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div 
      className="flex flex-col items-center gap-2 cursor-pointer mt-8 animate-fade-in"
      onClick={handleClick}
    >
      <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
      <span className="text-sm text-muted-foreground font-mono">scroll for more</span>
    </div>
  );
};

export default ScrollIndicator;
