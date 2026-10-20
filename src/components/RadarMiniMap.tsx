import React, { useEffect, useRef } from 'react';
import { TargetThreat } from '../types/game';

interface RadarMiniMapProps {
  targets: TargetThreat[];
}

export const RadarMiniMap: React.FC<RadarMiniMapProps> = ({ targets }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sweepAngleRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      sweepAngleRef.current = (sweepAngleRef.current + 0.04) % (Math.PI * 2);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = w / 2 - 4;

      ctx.clearRect(0, 0, w, h);

      // Radar dish background
      ctx.fillStyle = '#021208';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer border & rings
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Range rings
      [0.35, 0.7, 1.0].forEach((ring) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * ring, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Cardinal crosshair
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();

      // Sweeping beam
      ctx.save();
      ctx.translate(cx, cy);
      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      sweepGrad.addColorStop(0, 'rgba(74, 222, 128, 0.4)');
      sweepGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, sweepAngleRef.current - 0.4, sweepAngleRef.current);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Target blips
      targets.forEach((t) => {
        if (t.destroyed) return;
        // Project target screen coordinates onto radar
        const normDist = Math.min(1, t.distance / 5000);
        // azimuth angle based on x position relative to screen center
        const screenCenterX = window.innerWidth / 2;
        const bearing = ((t.x - screenCenterX) / screenCenterX) * (Math.PI / 3);

        const blipDist = r * (0.2 + normDist * 0.75);
        const bx = cx + Math.sin(bearing) * blipDist;
        const by = cy - Math.cos(bearing) * blipDist;

        ctx.fillStyle =
          t.isBoss || t.threatLevel === 'boss'
            ? '#ef4444'
            : t.threatLevel === 'critical'
            ? '#f87171'
            : t.type === 'geran2' || t.type === 'geran4_seeker'
            ? '#f59e0b'
            : t.type === 'fpv'
            ? '#38bdf8'
            : '#4ade80';
        ctx.beginPath();
        ctx.arc(bx, by, t.threatLevel === 'critical' ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [targets]);

  return (
    <div className="flex flex-col items-center bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 p-2 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between w-full px-1 mb-1">
        <span className="text-[10px] font-hud uppercase tracking-wider text-emerald-400 font-bold">
          РЛС СПОСТЕРЕЖЕННЯ
        </span>
        <span className="text-[9px] font-code text-neutral-400">30 КМ</span>
      </div>
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        className="rounded-full border border-emerald-500/20 shadow-inner"
      />
    </div>
  );
};
