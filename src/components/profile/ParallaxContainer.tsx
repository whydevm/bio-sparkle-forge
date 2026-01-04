import { useEffect, useRef, useState, ReactNode } from "react";

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

  useEffect(() => {
    if (!enabled) {
      setTransform({ rotateX: 0, rotateY: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const maxTilt = (intensity / 100) * 15; // Max 15 degrees at intensity 100
      
      let rotateX = (mouseY / (rect.height / 2)) * maxTilt * -1;
      let rotateY = (mouseX / (rect.width / 2)) * maxTilt;

      if (inverted) {
        rotateX *= -1;
        rotateY *= -1;
      }

      setTransform({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
      setTransform({ rotateX: 0, rotateY: 0 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [enabled, intensity, inverted]);

  return (
    <div
      ref={containerRef}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: "transform 0.1s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxContainer;
