import React, { useRef, useEffect } from 'react';
import type { DrawingCommand } from '../types/drawing';

interface CanvasProps {
  commands: DrawingCommand[];
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ commands, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw each command
    commands.forEach(command => {
      ctx.strokeStyle = command.color;
      ctx.fillStyle = command.color;
      ctx.lineWidth = 2;

      switch (command.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(command.x, command.y, command.radius || 20, 0, 2 * Math.PI);
          if (command.filled) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
          break;

        case 'rectangle':
          if (command.filled) {
            ctx.fillRect(command.x, command.y, command.width || 50, command.height || 50);
          } else {
            ctx.strokeRect(command.x, command.y, command.width || 50, command.height || 50);
          }
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(command.x, command.y);
          ctx.lineTo(command.x2 || command.x + 50, command.y2 || command.y + 50);
          ctx.stroke();
          break;

        case 'triangle':
          if (command.points && command.points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(command.points[0].x, command.points[0].y);
            command.points.slice(1).forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.closePath();
            if (command.filled) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
          }
          break;

        case 'ellipse':
          ctx.beginPath();
          ctx.ellipse(
            command.x, 
            command.y, 
            command.width || 40, 
            command.height || 20, 
            0, 
            0, 
            2 * Math.PI
          );
          if (command.filled) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
          break;
      }
    });
  }, [commands, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300 bg-white rounded-lg shadow-sm"
    />
  );
};