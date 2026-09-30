import React, { useEffect, useRef } from 'react';

export const ParticleWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    const cols = 48;
    const rows = 28;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const spacingX = width / (cols + 2);
      const spacingY = height / (rows + 2);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const u = i / cols;
          const v = j / rows;

          const wave1 = Math.sin(u * 5 + time * 1.2) * 16;
          const wave2 = Math.cos(v * 4 + time * 0.9) * 12;
          const wave3 = Math.sin((u + v) * 4 - time * 0.7) * 10;

          const x = spacingX * (i + 1.5) + Math.cos(u * 3 + time * 0.4) * 6;
          const y = spacingY * (j + 1.5) + wave1 + wave2 + wave3;

          const alpha = 0.2 + (0.5 * (Math.sin(u * 4 + time) + 1)) / 2;
          const size = 1.2 + Math.sin(u * 3 + v * 3 + time) * 0.8;

          ctx.fillStyle = `rgba(42, 127, 143, ${alpha * 0.75})`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.6, size), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      time += 0.02;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
};
