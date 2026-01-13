import { useRef, useState, ReactNode } from "react";

interface ParallaxContainerProps {
  children: ReactNode;
  enabled: boolean;
  intensity: number;
  inverted: boolean;
}

const ParallaxContainer = ({ 
  children, 
  enabled, 
  intensity = 50, 
  inverted = false 
}: ParallaxContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const maxTilt = (intensity / 100) * 15;
    
    let rotateX = (mouseY / (rect.height / 2)) * maxTilt * -1;
    let rotateY = (mouseX / (rect.width / 2)) * maxTilt;

    // Clamp values
    rotateX = Math.max(-maxTilt, Math.min(maxTilt, rotateX));
    rotateY = Math.max(-maxTilt, Math.min(maxTilt, rotateY));

    if (inverted) {
      rotateX *= -1;
      rotateY *= -1;
    }

    setTransform({ rotateX, rotateY });
  };

  const handleMouseEnter = () => {
    if (enabled) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovering(false);
  };

  return (
    <div
      ref={containerRef}
      className="w-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: enabled && isHovering
          ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxContainer;
