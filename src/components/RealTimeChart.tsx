import React, { useEffect, useRef } from 'react';

interface ChartProps {
  data: { time: number; value: number }[];
  color: string;
  label: string;
  maxTime: number;
  maxValue: number;
  height?: number;
}

export default function RealTimeChart({ data, color, label, maxTime, maxValue, height = 150 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Styling
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw Grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = (rect.height / 4) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
    }
    ctx.stroke();

    if (data.length < 2) return;

    // Draw Graph
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Map data points to canvas coordinates
    // x = (time / maxTime) * width
    // y = height - (value / maxValue) * height
    
    // Ensure we don't divide by zero
    const safeMaxTime = maxTime > 0 ? maxTime : 10;
    const safeMaxValue = maxValue > 0 ? maxValue : 100;

    data.forEach((point, index) => {
      const x = (point.time / safeMaxTime) * rect.width;
      const y = rect.height - (point.value / safeMaxValue) * rect.height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw Gradient Area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, `${color}40`); // 25% opacity
    gradient.addColorStop(1, `${color}00`); // 0% opacity

    ctx.fillStyle = gradient;
    ctx.lineTo(rect.width, rect.height); // Bottom right (approx) - actually should be last x
    ctx.lineTo((data[data.length - 1].time / safeMaxTime) * rect.width, rect.height);
    ctx.lineTo(0, rect.height); // Bottom left
    ctx.fill();

    // Draw glowing dot at the latest point
    const lastPoint = data[data.length - 1];
    const lastX = (lastPoint.time / safeMaxTime) * rect.width;
    const lastY = rect.height - (lastPoint.value / safeMaxValue) * rect.height;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [data, color, maxTime, maxValue]);

  return (
    <div className="relative w-full bg-black/40 rounded-lg border border-white/5 overflow-hidden">
      <div className="absolute top-2 left-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 z-10">
        {label}
      </div>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: `${height}px` }} 
        className="block"
      />
    </div>
  );
}
