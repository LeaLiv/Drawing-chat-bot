import React, { useRef, useEffect } from 'react';

interface CanvasProps {
  commands: any[];
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

    // Draw each shape directly from server data
    commands.forEach(item => {
      ctx.strokeStyle = item.color || 'black';
      ctx.fillStyle = item.color || 'black';
      ctx.lineWidth = 2;

      const scale = 3;
      const offsetX = 200;
      const offsetY = 100;
      
      const dims = item.dimensions || {};

      switch (item.shape) {
        case 'circle':
          const cx = (dims.x ?? 100) * scale + offsetX;
          const cy = (dims.y ?? 100) * scale + offsetY;
          ctx.beginPath();
          ctx.arc(cx, cy, (dims.radius || 20) * scale, 0, 2 * Math.PI);
          ctx.fill();
          break;

        case 'ellipse':
          const ex = (dims.x ?? 100) * scale + offsetX;
          const ey = (dims.y ?? 100) * scale + offsetY;
          ctx.beginPath();
          ctx.ellipse(ex, ey, (dims.radiusX || 20) * scale, (dims.radiusY || 10) * scale, 0, 0, 2 * Math.PI);
          ctx.fill();
          break;

        case 'rectangle':
          const rx = (dims.x ?? 100) * scale + offsetX;
          const ry = (dims.y ?? 100) * scale + offsetY;
          ctx.fillRect(rx, ry, (dims.width || 50) * scale, (dims.height || 50) * scale);
          break;

        case 'line':
          const lx1 = (dims.x1 ?? 100) * scale + offsetX;
          const ly1 = (dims.y1 ?? 100) * scale + offsetY;
          const lx2 = (dims.x2 ?? 150) * scale + offsetX;
          const ly2 = (dims.y2 ?? 150) * scale + offsetY;
          ctx.beginPath();
          ctx.moveTo(lx1, ly1);
          ctx.lineTo(lx2, ly2);
          ctx.stroke();
          break;

        case 'triangle':
          const tx = (dims.x ?? 100) * scale + offsetX;
          const ty = (dims.y ?? 100) * scale + offsetY;
          const base = (dims.width || 50) * scale;
          const triangleHeight = (dims.height || 50) * scale;
          ctx.beginPath();
          ctx.moveTo(tx, ty + triangleHeight);
          ctx.lineTo(tx + base / 2, ty);
          ctx.lineTo(tx + base, ty + triangleHeight);
          ctx.closePath();
          ctx.fill();
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