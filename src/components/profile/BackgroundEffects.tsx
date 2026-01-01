import { useEffect, useRef } from "react";

interface BackgroundEffectsProps {
  effect: string;
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

    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const initParticles = (count: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (effect === "particles" ? 0.3 : effect === "snow" ? 0.2 : 0),
          vy: effect === "snow" ? Math.random() * 0.8 + 0.3 : effect === "rain" ? Math.random() * 4 + 6 : (Math.random() - 0.5) * 0.3,
          size: effect === "rain" ? 1 : Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.25 + 0.1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (effect === "oldtv") {
        // Old TV scanlines and noise
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * 20;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
          data[i + 3] = 30;
        }
        ctx.putImageData(imageData, 0, 0);

        // Scanlines
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        for (let y = 0; y < canvas.height; y += 3) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Flickering effect
        if (Math.random() > 0.97) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Vertical hold distortion
        const distortY = Math.sin(Date.now() * 0.001) * 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
        ctx.fillRect(0, canvas.height / 2 + distortY - 10, canvas.width, 20);
      } else {
        // Particles, snow, or rain
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.y < -10) {
            p.y = canvas.height + 10;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;

          ctx.beginPath();
          if (effect === "rain") {
            ctx.strokeStyle = `rgba(150, 180, 255, ${p.opacity})`;
            ctx.lineWidth = p.size * 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + 15);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    if (effect === "particles") initParticles(40);
    else if (effect === "snow") initParticles(80);
    else if (effect === "rain") initParticles(100);

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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        mixBlendMode: effect === "oldtv" ? "overlay" : "normal",
        opacity: effect === "oldtv" ? 0.3 : 0.4,
      }}
    />
  );
};

export default BackgroundEffects;
