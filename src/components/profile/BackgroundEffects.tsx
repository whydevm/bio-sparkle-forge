import { useEffect, useRef } from "react";

interface BackgroundEffectsProps {
  effect: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  wobble?: number;
  wobbleSpeed?: number;
  depth?: number;
  length?: number;
  splashTimer?: number;
}

const BackgroundEffects = ({ effect }: BackgroundEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effect === "none") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let particles: Particle[] = [];

    const initSnowParticles = (count: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.5 + depth * 1.5,
          size: 1 + depth * 3,
          opacity: 0.3 + depth * 0.5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.02,
          depth,
        });
      }
    };

    const initRainParticles = (count: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 1 + depth * 2,
          vy: 8 + depth * 12,
          size: 0.5 + depth * 1.5,
          opacity: 0.2 + depth * 0.4,
          length: 15 + depth * 25,
          depth,
          splashTimer: 0,
        });
      }
    };

    const initFloatingParticles = (count: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 1 + depth * 2.5,
          opacity: 0.2 + depth * 0.4,
          depth,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (effect === "oldtv") {
        // More realistic old TV effect
        const time = Date.now() * 0.001;
        
        // Create noise with varying intensity
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * 35;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
          data[i + 3] = 25;
        }
        ctx.putImageData(imageData, 0, 0);

        // Horizontal scanlines with varying opacity
        for (let y = 0; y < canvas.height; y += 2) {
          const lineOpacity = 0.03 + Math.sin(y * 0.1 + time * 2) * 0.02;
          ctx.fillStyle = `rgba(0, 0, 0, ${lineOpacity})`;
          ctx.fillRect(0, y, canvas.width, 1);
        }

        // Rolling band effect
        const bandY = ((time * 50) % (canvas.height + 100)) - 50;
        const gradient = ctx.createLinearGradient(0, bandY - 30, 0, bandY + 30);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.03)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bandY - 30, canvas.width, 60);

        // Random flicker
        if (Math.random() > 0.97) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Subtle color aberration
        if (Math.random() > 0.995) {
          ctx.fillStyle = "rgba(255, 0, 0, 0.02)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (effect === "snow") {
        // Realistic snow with depth, wobble, and wind
        particles.forEach((p) => {
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02);
          p.x += p.vx + Math.sin(p.wobble) * 0.5;
          p.y += p.vy;

          if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width + 10) p.x = -10;
          if (p.x < -10) p.x = canvas.width + 10;

          // Draw snowflake with glow effect
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          glow.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          glow.addColorStop(0.5, `rgba(255, 255, 255, ${p.opacity * 0.5})`);
          glow.addColorStop(1, "rgba(255, 255, 255, 0)");
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core snowflake
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        });
      } else if (effect === "rain") {
        // Realistic rain with angle and depth
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width + 50) p.x = -50;

          // Draw angled rain streak with gradient
          const length = p.length || 20;
          const gradient = ctx.createLinearGradient(
            p.x, p.y, 
            p.x + p.vx * 3, p.y + length
          );
          gradient.addColorStop(0, `rgba(180, 200, 255, 0)`);
          gradient.addColorStop(0.3, `rgba(180, 200, 255, ${p.opacity})`);
          gradient.addColorStop(1, `rgba(180, 200, 255, ${p.opacity * 0.3})`);

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 3, p.y + length);
          ctx.stroke();
        });
      } else if (effect === "particles") {
        // Elegant floating particles with connections
        const connectionDistance = 120;

        particles.forEach((p, i) => {
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.015);
          p.x += p.vx + Math.sin(p.wobble) * 0.2;
          p.y += p.vy + Math.cos(p.wobble) * 0.2;

          if (p.y > canvas.height + 10) p.y = -10;
          if (p.y < -10) p.y = canvas.height + 10;
          if (p.x > canvas.width + 10) p.x = -10;
          if (p.x < -10) p.x = canvas.width + 10;

          // Draw connections to nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
              const opacity = (1 - dist / connectionDistance) * 0.15;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Draw particle with glow
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glow.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          glow.addColorStop(0.5, `rgba(255, 255, 255, ${p.opacity * 0.3})`);
          glow.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    if (effect === "particles") initFloatingParticles(50);
    else if (effect === "snow") initSnowParticles(100);
    else if (effect === "rain") initRainParticles(150);

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [effect]);

  if (effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ 
        mixBlendMode: effect === "oldtv" ? "overlay" : "normal",
        opacity: effect === "oldtv" ? 0.4 : 0.6,
      }}
    />
  );
};

export default BackgroundEffects;
