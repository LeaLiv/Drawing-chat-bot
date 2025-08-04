// src/components/DrawingCanvas.tsx

import React, { useRef, useEffect } from 'react';
import type { DrawingData, DrawingComponent } from '../types/drawing';

interface CanvasProps {
  drawingData: DrawingData | null;
}

const drawComponent = (ctx: CanvasRenderingContext2D, component: DrawingComponent) => {
    if (!component.shape || !component.color) return; 

    ctx.strokeStyle = component.color;
    ctx.fillStyle = component.color;
    ctx.lineWidth = 2;

    switch (component.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(component.cx ?? 0, component.cy ?? 0, component.radius ?? 20, 0, 2 * Math.PI);
        (component.filled ?? true) ? ctx.fill() : ctx.stroke();
        break;

      case 'rectangle':
        (component.filled ?? true) 
          ? ctx.fillRect(component.x ?? 0, component.y ?? 0, component.width ?? 50, component.height ?? 50)
          : ctx.strokeRect(component.x ?? 0, component.y ?? 0, component.width ?? 50, component.height ?? 50);
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(component.x1 ?? 0, component.y1 ?? 0);
        ctx.lineTo(component.x2 ?? 50, component.y2 ?? 50);
        ctx.stroke();
        break;

      case 'triangle':
        if (component.points && component.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(component.points[0].x, component.points[0].y);
          component.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
          ctx.closePath();
          (component.filled ?? true) ? ctx.fill() : ctx.stroke();
        }
        break;
      
      case 'ellipse':
         ctx.beginPath();
         ctx.ellipse(component.x ?? 0, component.y ?? 0, component.width ?? 40, component.height ?? 20, 0, 0, 2 * Math.PI);
         (component.filled ?? true) ? ctx.fill() : ctx.stroke();
         break;
    }
};

export const Canvas: React.FC<CanvasProps> = ({ drawingData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = drawingData?.canvasWidth ?? 500;
    const height = drawingData?.canvasHeight ?? 500;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height); 

    if (!drawingData || !Array.isArray(drawingData.objects)) {
      ctx.fillStyle = "lightgray";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("הקנבס מוכן...", width / 2, height / 2);
      return;
    }
    
    drawingData.objects.forEach(logicalObject => {
      if (logicalObject.components) {
          logicalObject.components.forEach(component => {
              drawComponent(ctx, component);
          });
      }
    });

  }, [drawingData]);

  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-300 bg-white rounded-lg shadow-lg"
    />
  );
};