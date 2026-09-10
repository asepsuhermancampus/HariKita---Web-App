"use client";

import React, { useEffect, useRef } from "react";

interface GoldenDustCanvasProps {
  className?: string;
  particleCount?: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
}

const GOLD_COLORS = [
  "#CCA873", // Gilded Gold
  "#F5E0A3", // Shimmering Pale Gold
  "#D9B263", // Royal Antique Gold
  "#FFFFFF", // Bright Glint
];

export const GoldenDustCanvas: React.FC<GoldenDustCanvasProps> = ({
  className = "absolute inset-0 pointer-events-none z-10",
  particleCount = 35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particles: DustParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedY: -(Math.random() * 0.4 + 0.1), // Gentle upward float
      speedX: (Math.random() - 0.5) * 0.3,
      baseOpacity: Math.random() * 0.6 + 0.3,
      opacity: 0.5,
      pulseSpeed: Math.random() * 0.04 + 0.02,
      pulseOffset: Math.random() * Math.PI * 2,
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity = p.baseOpacity * (0.6 + 0.4 * Math.sin(tick * p.pulseSpeed + p.pulseOffset));

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};
