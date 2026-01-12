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
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const maxTilt = (intensity / 100) * 15;
      
      let rotateX = (mouseY / centerY) * maxTilt * -1;
      let rotateY = (mouseX / centerX) * maxTilt;

      // Clamp values
      rotateX = Math.max(-maxTilt, Math.min(maxTilt, rotateX));
      rotateY = Math.max(-maxTilt, Math.min(maxTilt, rotateY));

      if (inverted) {
        rotateX *= -1;
        rotateY *= -1;
      }

      setTransform({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
      setTransform({ rotateX: 0, rotateY: 0 });
    };

    // Attach to window for global mouse tracking
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, intensity, inverted]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        transform: enabled 
          ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`
          : "none",
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxContainer;
