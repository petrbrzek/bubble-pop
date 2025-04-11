"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface ActiveSwipeTrailProps {
  points: Point[];
  color: string;
}

// This component shows the trail DURING the active swipe
const ActiveSwipeTrail = ({ points, color }: ActiveSwipeTrailProps) => {
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
    ctx.lineWidth = 8; // Reduced from 20 to 8
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Add shadow for glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw the path with a solid color for better visibility during active swipe
    ctx.strokeStyle = color;
    
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

    // Add a glowing circle at the end of the trail (current finger position)
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      
      // Outer glow
      const gradient = ctx.createRadialGradient(
        lastPoint.x, lastPoint.y, 0,
        lastPoint.x, lastPoint.y, 30
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner circle
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [points, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ActiveSwipeTrail;