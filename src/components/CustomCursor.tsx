import { useEffect, useRef } from "react";

interface CustomCursorProps {
  cursorUrl?: string;
}

const CustomCursor = ({ cursorUrl }: CustomCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorUrl) {
      document.body.classList.remove("hide-cursor");
      return;
    }

    // Hide default cursor completely when custom cursor is active
    document.body.classList.add("hide-cursor");

    const moveCursor = (e: MouseEvent | TouchEvent) => {
      if (!cursorRef.current) return;

      let x, y;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }

      cursorRef.current.style.left = `${x}px`;
      cursorRef.current.style.top = `${y}px`;
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("touchmove", moveCursor);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("touchmove", moveCursor);
      document.body.classList.remove("hide-cursor");
    };
  }, [cursorUrl]);

  if (!cursorUrl) return null;

  return (
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
  );
};

export default CustomCursor;