"use client";

import React, { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  className?: string;
  count?: number;
}

interface ConfettiPiece {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  shape: "rect" | "circle" | "ribbon";
}

const CONFETTI_COLORS = [
  "#3B82F6", // Sky Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#EF4444", // Red
];

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({
  className = "absolute inset-0 pointer-events-none z-10",
  count = 35,
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

    const shapes: ("rect" | "circle" | "ribbon")[] = ["rect", "circle", "ribbon"];

    const confetti: ConfettiPiece[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 2 + 1.2,
      speedX: (Math.random() - 0.5) * 1.2,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      opacity: Math.random() * 0.4 + 0.6,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      confetti.forEach((c) => {
        c.y += c.speedY;
        c.x += c.speedX;
        c.angle += c.rotationSpeed;

        if (c.y > height + 20) {
          c.y = -20;
          c.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;

        if (c.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, c.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.shape === "ribbon") {
          ctx.beginPath();
          ctx.rect(-c.size * 0.2, -c.size * 1.2, c.size * 0.4, c.size * 2.4);
          ctx.fill();
        } else {
          ctx.fillRect(-c.size * 0.5, -c.size * 0.5, c.size, c.size);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={className} />;
};
