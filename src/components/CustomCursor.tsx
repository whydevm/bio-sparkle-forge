import { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface CustomCursorProps {
  cursorUrl?: string;
  trailingEnabled?: boolean;
  trailCount?: number;
}

const CustomCursor = ({ cursorUrl, trailingEnabled = false, trailCount = 8 }: CustomCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  const positionRef = useRef({ x: 0, y: 0 });
  const trailIdRef = useRef(0);

  useEffect(() => {
    if (!cursorUrl) {
      document.body.classList.remove("hide-cursor");
      return;
    }

    // Hide default cursor completely when custom cursor is active
    document.body.classList.add("hide-cursor");

    const moveCursor = (e: MouseEvent | TouchEvent) => {
      let x, y;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }

      positionRef.current = { x, y };

      if (cursorRef.current) {
        cursorRef.current.style.left = `${x}px`;
        cursorRef.current.style.top = `${y}px`;
      }

      // Add trail point if trailing is enabled
      if (trailingEnabled) {
        trailIdRef.current += 1;
        setTrails(prev => {
          const newTrails = [...prev, { x, y, id: trailIdRef.current }];
          // Keep only the last N trails
          return newTrails.slice(-trailCount);
        });
      }
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("touchmove", moveCursor);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("touchmove", moveCursor);
      document.body.classList.remove("hide-cursor");
    };
  }, [cursorUrl, trailingEnabled, trailCount]);

  // Clean up old trails
  useEffect(() => {
    if (!trailingEnabled) {
      setTrails([]);
      return;
    }

    const interval = setInterval(() => {
      setTrails(prev => prev.slice(-trailCount));
    }, 50);

    return () => clearInterval(interval);
  }, [trailingEnabled, trailCount]);

  if (!cursorUrl) return null;

  return (
    <>
      {/* Trail cursors */}
      {trailingEnabled && trails.map((trail, index) => {
        const opacity = ((index + 1) / trails.length) * 0.6;
        const scale = 0.5 + ((index + 1) / trails.length) * 0.5;
        
        return (
          <div
            key={trail.id}
            className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
            style={{
              left: `${trail.x}px`,
              top: `${trail.y}px`,
              width: "32px",
              height: "32px",
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <img
              src={cursorUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        );
      })}

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "32px",
          height: "32px",
        }}
      >
        <img
          src={cursorUrl}
          alt="Custom cursor"
          className="w-full h-full object-contain"
        />
      </div>
    </>
  );
};

export default CustomCursor;
