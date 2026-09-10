"use client";

import React, { useEffect, useRef } from "react";

interface AutumnLeavesCanvasProps {
  className?: string;
  leafCount?: number;
}

interface LeafParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  swingRange: number;
  swingSpeed: number;
  swingOffset: number;
}

const LEAF_COLORS = [
  "#C86D51", // Warm Terracotta
  "#E2A76F", // Golden Ochre
  "#B85D43", // Rust Amber
  "#D99B6A", // Soft Caramel
  "#8C3E2F", // Deep Maple
];

export const AutumnLeavesCanvas: React.FC<AutumnLeavesCanvasProps> = ({
  className = "absolute inset-0 pointer-events-none z-10",
  leafCount = 24,
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

    // Initialize particles
    const leaves: LeafParticle[] = Array.from({ length: leafCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 12 + 10,
      speedY: Math.random() * 1.5 + 0.8,
      speedX: Math.random() * 0.8 - 0.4,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      opacity: Math.random() * 0.5 + 0.4,
      swingRange: Math.random() * 30 + 15,
      swingSpeed: Math.random() * 0.02 + 0.01,
      swingOffset: Math.random() * Math.PI * 2,
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      leaves.forEach((leaf) => {
        leaf.y += leaf.speedY;
        leaf.x += Math.sin(tick * leaf.swingSpeed + leaf.swingOffset) * 0.8 + leaf.speedX;
        leaf.angle += leaf.rotationSpeed;

        // Reset if past screen bottom
        if (leaf.y > height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * width;
        }

        // Draw leaf
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.globalAlpha = leaf.opacity;
        ctx.fillStyle = leaf.color;

        // Realistic curved leaf path
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size);
        ctx.bezierCurveTo(
          leaf.size * 0.6,
          -leaf.size * 0.5,
          leaf.size * 0.6,
          leaf.size * 0.5,
          0,
          leaf.size
        );
        ctx.bezierCurveTo(
          -leaf.size * 0.6,
          leaf.size * 0.5,
          -leaf.size * 0.6,
          -leaf.size * 0.5,
          0,
          -leaf.size
        );
        ctx.fill();

        // Leaf stem vein
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size * 0.8);
        ctx.lineTo(0, leaf.size * 0.9);
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [leafCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};
