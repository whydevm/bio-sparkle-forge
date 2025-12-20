import { useState, useEffect } from "react";

interface CountUpAnimationProps {
  target: number;
  duration?: number;
}

const CountUpAnimation = ({ target, duration = 800 }: CountUpAnimationProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Faster ease out for quicker count
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const currentCount = Math.floor(easeOut * target);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    
    requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export default CountUpAnimation;
