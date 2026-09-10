"use client";

import React, { useEffect, useRef } from "react";

interface FloatingPetalsCanvasProps {
  className?: string;
  petalCount?: number;
}

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  flip: number;
  flipSpeed: number;
}

const PETAL_COLORS = [
  "rgba(242, 174, 193, 0.75)", // Soft Blush
  "rgba(212, 168, 156, 0.75)", // Rose Sand
  "rgba(232, 152, 159, 0.8)",  // Romantic Petal Pink
  "rgba(255, 214, 222, 0.7)",  // Pale Blossom
];

export const FloatingPetalsCanvas: React.FC<FloatingPetalsCanvasProps> = ({
  className = "absolute inset-0 pointer-events-none z-10",
  petalCount = 20,
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

    const petals: PetalParticle[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 10 + 8,
      speedY: Math.random() * 1.2 + 0.5,
      speedX: Math.random() * 0.6 - 0.3,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      opacity: Math.random() * 0.4 + 0.5,
      flip: Math.random() * Math.PI,
      flipSpeed: Math.random() * 0.03 + 0.01,
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(tick * 0.015 + p.angle) * 0.7 + p.speedX;
        p.angle += p.rotationSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, Math.sin(p.flip));
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Realistic curved rose petal teardrop shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size, -p.size * 0.8, p.size * 1.4, p.size * 0.6, 0, p.size * 1.2);
        ctx.bezierCurveTo(-p.size * 1.4, p.size * 0.6, -p.size, -p.size * 0.8, 0, 0);
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
  }, [petalCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};
