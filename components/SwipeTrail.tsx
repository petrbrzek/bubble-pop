"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeTrailProps {
  points: Point[];
  color: string;
  duration: number;
}

const SwipeTrail = ({ points, color, duration }: SwipeTrailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    // Set canvas dimensions to match its display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set line style - thinner line as requested
    ctx.lineWidth = 6; // Reduced from 16 to 6
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Create gradient effect with more vibrant colors
    const gradient = ctx.createLinearGradient(
      points[0].x, 
      points[0].y, 
      points[points.length - 1].x, 
      points[points.length - 1].y
    );
    
    // More vibrant gradient with glow effect
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)"); // More visible start
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.3)"); // More visible end
    ctx.strokeStyle = gradient;

    // Add shadow for glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw the path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    // If we have enough points, connect to the last one
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    }

    ctx.stroke();

    // Add particles at the end of the trail for extra visual feedback
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      
      // Draw small glowing circles at the end of the trail
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw smaller white highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [points, color]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration / 1000, ease: "easeOut" }}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default SwipeTrail;