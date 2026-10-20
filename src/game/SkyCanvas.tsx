import React, { useEffect, useRef } from 'react';
import { Simulation } from './simulation';
import { VisionMode, TargetThreat } from '../types/game';
import { WEAPON_CONFIGS } from './constants';
import { useTranslation } from '../i18n/LanguageContext';

interface SkyCanvasProps {
  simulation: Simulation;
  visionMode: VisionMode;
  showLeadAid: boolean;
  onFire: (x: number, y: number) => void;
  crosshairPos: { x: number; y: number };
}

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  simulation,
  visionMode,
  showLeadAid,
  onFire,
  crosshairPos,
}) => {
  const { t, getTargetName } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<{ x: number; y: number; r: number; alpha: number; twinkleSpeed: number }[]>([]);
  const dustParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number }[]>([]);
  const radarAngleRef = useRef<number>(0);

  useEffect(() => {
    const stars: { x: number; y: number; r: number; alpha: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.75,
        r: 0.6 + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3,
      });
    }
    starsRef.current = stars;

    const dust: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 80; i++) {
      dust.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 15,
        vy: -10 - Math.random() * 20,
        size: 1 + Math.random() * 2,
      });
    }
    dustParticlesRef.current = dust;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      simulation.searchlightTargetX = crosshairPos.x;
      simulation.searchlightTargetY = crosshairPos.y;
      simulation.setCrosshair(crosshairPos.x, crosshairPos.y);
      simulation.update(dt, w, h);

      if (visionMode === 'radar') {
        renderRadarMode(ctx, w, h, dt);
      } else if (visionMode === 'thermal') {
        renderThermalMode(ctx, w, h, time);
      } else {
        renderOpticalMode(ctx, w, h, time, dt);
      }

      renderTacticalReticle(ctx, w, h);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [simulation, visionMode, crosshairPos, showLeadAid]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onFire(x, y);
  };

  // --- 1. OPTICAL NIGHT VISION ---
  const renderOpticalMode = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    dt: number
  ) => {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#030712');
    skyGrad.addColorStop(0.55, '#070f1e');
    skyGrad.addColorStop(0.82, '#0c1a2e');
    skyGrad.addColorStop(1, '#050b14');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    const nowSec = time / 1000;
    ctx.fillStyle = '#ffffff';
    for (const s of starsRef.current) {
      const alpha = s.alpha * (0.7 + 0.3 * Math.sin(nowSec * s.twinkleSpeed));
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const puff of simulation.distantFlakPuffs) {
      ctx.fillStyle = puff.color;
      ctx.globalAlpha = (1 - puff.life / puff.maxLife) * 0.7;
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, 4 + puff.life * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (simulation.searchlightOn) {
      const truckX = w * 0.5;
      const truckY = h * 0.98;
      const beamTargetX = simulation.searchlightTargetX;
      const beamTargetY = simulation.searchlightTargetY;

      const angle = Math.atan2(beamTargetY - truckY, beamTargetX - truckX);
      const beamLength = Math.hypot(beamTargetX - truckX, beamTargetY - truckY) + 600;
      const spreadAngle = 0.16;

      ctx.save();
      ctx.translate(truckX, truckY);
      ctx.rotate(angle);

      const beamGrad = ctx.createRadialGradient(0, 0, 10, beamLength * 0.7, 0, beamLength);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.22)');
      beamGrad.addColorStop(0.7, 'rgba(217, 249, 157, 0.08)');
      beamGrad.addColorStop(1, 'rgba(217, 249, 157, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, beamLength, -spreadAngle, spreadAngle);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      const spotGrad = ctx.createRadialGradient(beamTargetX, beamTargetY, 10, beamTargetX, beamTargetY, 140);
      spotGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      spotGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.15)');
      spotGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(beamTargetX, beamTargetY, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 220, 0.6)';
      for (const d of dustParticlesRef.current) {
        d.x += (d.vx * dt) / w;
        d.y += (d.vy * dt) / h;
        if (d.y < 0) d.y = 1;
        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;

        const px = d.x * w;
        const py = d.y * h;
        const distToSpot = Math.hypot(px - beamTargetX, py - beamTargetY);
        if (distToSpot < 180) {
          ctx.beginPath();
          ctx.arc(px, py, d.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    renderCitySkyline(ctx, w, h);

    for (const target of simulation.targets) {
      drawTargetOptical(ctx, target, time);
    }

    drawProjectiles(ctx, false);
    drawParticles(ctx, false);
  };

  // --- 2. FLIR THERMAL SENSOR ---
  const renderThermalMode = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number
  ) => {
    ctx.fillStyle = '#020b06';
    ctx.fillRect(0, 0, w, h);

    renderCitySkyline(ctx, w, h, true);

    ctx.fillStyle = 'rgba(20, 83, 45, 0.06)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    ctx.fillStyle = '#22c55e';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('SENSOR: FLIR HD-IR [W-HOT]', 24, 40);
    ctx.fillText(`FOV: 35.4° · ELEV: +${((1 - crosshairPos.y / h) * 45).toFixed(1)}°`, 24, 56);
    ctx.fillText(`THERMAL GAIN: 98%`, w - 170, 40);

    for (const target of simulation.targets) {
      drawTargetThermal(ctx, target, time);
    }

    drawProjectiles(ctx, true);
    drawParticles(ctx, true);
  };

  // --- 3. RADAR PPI SCOPE ---
  const renderRadarMode = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dt: number
  ) => {
    radarAngleRef.current = (radarAngleRef.current + dt * 1.4) % (Math.PI * 2);
    const sweepAngle = radarAngleRef.current;

    ctx.fillStyle = '#021208';
    ctx.fillRect(0, 0, w, h);

    const centerX = w * 0.5;
    const centerY = h * 0.82;
    const maxRadius = Math.min(w * 0.48, h * 0.75);

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.lineWidth = 1;
    const rings = [0.25, 0.5, 0.75, 1.0];
    const ringRanges = ['5 KM', '12 KM', '20 KM', '30 KM'];

    rings.forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * r, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(ringRanges[idx], centerX + maxRadius * r - 35, centerY - 6);
    });

    for (let deg = 180; deg <= 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    const beamGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, maxRadius);
    beamGrad.addColorStop(0, 'rgba(74, 222, 128, 0.35)');
    beamGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, sweepAngle - 0.25, sweepAngle);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();

    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(sweepAngle) * maxRadius, Math.sin(sweepAngle) * maxRadius);
    ctx.stroke();
    ctx.restore();

    renderCitySkyline(ctx, w, h, true);

    for (const target of simulation.targets) {
      drawTargetRadar(ctx, target);
    }

    drawProjectiles(ctx, false, true);
    drawParticles(ctx, true);
  };

  const renderCitySkyline = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    isGreen: boolean = false
  ) => {
    const horizonY = h * 0.82;

    ctx.save();
    ctx.fillStyle = isGreen ? '#011a0c' : '#030b14';
    ctx.fillRect(0, horizonY, w, h - horizonY);

    ctx.fillStyle = isGreen ? '#032410' : '#050c18';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);

    const step = w / 28;
    for (let i = 0; i <= 28; i++) {
      const bx = i * step;
      let bHeight = 25 + Math.sin(i * 1.8) * 18 + (i % 3 === 0 ? 30 : 0);
      if (i === 14) bHeight = 85;
      if (i === 8 || i === 20) bHeight = 55;
      ctx.lineTo(bx, horizonY - bHeight);
      ctx.lineTo(bx + step * 0.85, horizonY - bHeight);
    }
    ctx.lineTo(w, horizonY);
    ctx.closePath();
    ctx.fill();

    if (!isGreen) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
      for (let i = 0; i < 28; i++) {
        if (i % 2 === 0) {
          const lx = i * step + 8;
          ctx.fillRect(lx, horizonY - 14, 3, 3);
          ctx.fillRect(lx + 6, horizonY - 22, 3, 3);
        }
      }
    }
    ctx.restore();
  };

  // --- DRAW TARGET: OPTICAL MODE ---
  const drawTargetOptical = (ctx: CanvasRenderingContext2D, target: TargetThreat, time: number) => {
    ctx.save();
    ctx.translate(target.x, target.y);

    const angle = Math.atan2(target.vy, target.vx);
    ctx.rotate(angle);

    const scale = Math.max(0.6, Math.min(2.8, (4500 / target.distance) * target.size));
    ctx.scale(scale, scale);

    const isLit = target.illuminated;

    if (target.type === 'fpv') {
      // 1. FPV ДРОН: Квадрокоптер з боєприпасом RPG-7
      ctx.strokeStyle = isLit ? '#f8fafc' : '#475569';
      ctx.lineWidth = 1.5;
      // X-frame arms
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, 10);
      ctx.moveTo(-10, 10);
      ctx.lineTo(10, -10);
      ctx.stroke();

      // 4 Rotors spinning blur
      const rAngle = (time / 30) % (Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      [[-10, -10], [10, -10], [-10, 10], [10, 10]].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(rx, ry, 6, 2, rAngle, 0, Math.PI * 2);
        ctx.fill();
      });

      // RPG warhead underneath
      ctx.fillStyle = isLit ? '#22c55e' : '#15803d';
      ctx.fillRect(-6, -2, 12, 4);
    } else if (target.type === 'geran2' || target.type === 'gerbera') {
      // 2. ГЕРАНЬ-2 / ГЕРБЕРА: Дельтоподібне крило
      const bodyColor = isLit ? '#94a3b8' : '#1e293b';
      const wingColor = isLit ? '#cbd5e1' : '#0f172a';

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, -18);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 18);
      ctx.closePath();
      ctx.fillStyle = wingColor;
      ctx.fill();
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isLit ? '#e2e8f0' : '#334155';
      ctx.fillRect(-14, -20, 6, 3);
      ctx.fillRect(-14, 17, 6, 3);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-10, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      if (target.type === 'geran2') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
        ctx.beginPath();
        ctx.arc(-9, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (target.type === 'geran4_seeker') {
      // 3. ГЕРАНЬ-4 «СИКЕР»: Реактивне крило з оптичною ГСН
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-16, -19);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-16, 19);
      ctx.closePath();
      ctx.fillStyle = isLit ? '#e2e8f0' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Optical seeker eye on nose
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(17, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Jet exhaust flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-10, 3);
      ctx.closePath();
      ctx.fill();
    } else if (target.type === 'geran5_seeker') {
      // 3.5. ГЕРАНЬ-5 «СИКЕР»: Дводвигунний реактивний БПЛА з ШІ-оптичною ГСН (2 стадія)
      // Інтегральне крило складної форми
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(8, -12);
      ctx.lineTo(-18, -24);
      ctx.lineTo(-12, -7);
      ctx.lineTo(-15, 0);
      ctx.lineTo(-12, 7);
      ctx.lineTo(-18, 24);
      ctx.lineTo(8, 12);
      ctx.closePath();
      ctx.fillStyle = isLit ? '#334155' : '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Спарені скошені кілі (twin canted vertical tails)
      ctx.fillStyle = isLit ? '#475569' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(-17, -22);
      ctx.lineTo(-20, -21);
      ctx.lineTo(-14, -13);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(-17, 22);
      ctx.lineTo(-20, 21);
      ctx.lineTo(-14, 13);
      ctx.closePath();
      ctx.fill();

      // Сферична поворотна оптико-електронна турель (ГСН) на носі
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(21, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(22.5, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Подвійні реактивні сопла з факелами мікротурбін
      [-5, 5].forEach((ey) => {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-12, ey - 2.5);
        ctx.lineTo(-26, ey);
        ctx.lineTo(-12, ey + 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(-12, ey - 1.2);
        ctx.lineTo(-20, ey);
        ctx.lineTo(-12, ey + 1.2);
        ctx.closePath();
        ctx.fill();
      });
    } else if (target.type === 'kh101_kalibr') {
      // 4. Х-101 / КАЛІБР: Високоточна малопомітна крилата ракета
      // 4.1. Розгортаємі прямі стрілоподібні крила (високоплан)
      ctx.fillStyle = isLit ? '#64748b' : '#1e293b';
      // Верхнє півкрило
      ctx.beginPath();
      ctx.moveTo(4, -3);
      ctx.lineTo(-2, -26);
      ctx.lineTo(-6, -26);
      ctx.lineTo(0, -3);
      ctx.closePath();
      ctx.fill();
      // Нижнє півкрило
      ctx.beginPath();
      ctx.moveTo(4, 3);
      ctx.lineTo(-2, 26);
      ctx.lineTo(-6, 26);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();

      // Сріблясті протиобліднювальні кромки крил
      ctx.strokeStyle = isLit ? '#94a3b8' : '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, -3);
      ctx.lineTo(-2, -26);
      ctx.moveTo(4, 3);
      ctx.lineTo(-2, 26);
      ctx.stroke();

      // 4.2. Сплюснутий малопомітний фюзеляж (стелс-грані)
      const fusGrad = ctx.createLinearGradient(0, -4, 0, 4);
      if (isLit) {
        fusGrad.addColorStop(0, '#64748b');
        fusGrad.addColorStop(0.3, '#475569');
        fusGrad.addColorStop(0.7, '#334155');
        fusGrad.addColorStop(1, '#1e293b');
      } else {
        fusGrad.addColorStop(0, '#334155');
        fusGrad.addColorStop(0.5, '#1e293b');
        fusGrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = fusGrad;
      ctx.beginPath();
      ctx.moveTo(30, 0); // Гострий кінчик радіопрозорого обтічника
      ctx.lineTo(20, -3.5);
      ctx.lineTo(-28, -3.5);
      ctx.lineTo(-32, -1.5);
      ctx.lineTo(-32, 1.5);
      ctx.lineTo(-28, 3.5);
      ctx.lineTo(20, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isLit ? '#94a3b8' : '#334155';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Радіопрозорий білий/світлий конус носового обтічника
      ctx.fillStyle = isLit ? '#f1f5f9' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(24, -2.5);
      ctx.lineTo(24, 2.5);
      ctx.closePath();
      ctx.fill();

      // Оптичне віконце комплексу корекції «Отблеск-У» на нижній частині носа
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(15, 1.5, 5, 2);

      // Секційні технологічні шви фюзеляжу
      ctx.strokeStyle = isLit ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 0.8;
      [-16, -4, 8].forEach((fx) => {
        ctx.beginPath();
        ctx.moveTo(fx, -3.5);
        ctx.lineTo(fx, 3.5);
        ctx.stroke();
      });

      // 4.3. Хвостове Т-подібне оперення (складні стабілізатори)
      ctx.fillStyle = isLit ? '#475569' : '#1e293b';
      // Верхній вертикальний кіль
      ctx.beginPath();
      ctx.moveTo(-24, -3.5);
      ctx.lineTo(-28, -12);
      ctx.lineTo(-31, -12);
      ctx.lineTo(-29, -3.5);
      ctx.closePath();
      ctx.fill();
      // Горизонтальні хвостові стабілізатори
      ctx.fillRect(-32, -7, 4, 14);

      // 4.4. КУЛЬТОВИЙ ВИСУВНИЙ ПІДФЮЗЕЛЯЖНИЙ ТУРБОВЕНТИЛЯТОРНИЙ ДВИГУН ТРДД-50А
      // Пілон кріплення двигуна під хвостовою частиною
      ctx.fillStyle = isLit ? '#334155' : '#0f172a';
      ctx.fillRect(-22, 3.5, 12, 1.5);
      // Гондола двигуна (підвішена під черевом)
      ctx.fillStyle = isLit ? '#475569' : '#1e293b';
      ctx.beginPath();
      ctx.ellipse(-16, 6, 7, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isLit ? '#94a3b8' : '#334155';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Повітрозабірник двигуна (передній зріз гондоли)
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(-9, 6, 1.2, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Сопло двигуна та гарячий струмінь ТРДД-50А
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-23, 4.5);
      ctx.lineTo(-38, 6);
      ctx.lineTo(-23, 7.5);
      ctx.closePath();
      ctx.fill();
      // Внутрішнє біле ядро вихлопу
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-23, 5.2);
      ctx.lineTo(-32, 6);
      ctx.lineTo(-23, 6.8);
      ctx.closePath();
      ctx.fill();
    } else if (target.type === 'kinzhal') {
      // 5. КИНДЖАЛ (Х-47М2): Гіперзвукова аеробалістична ракета повітряного базування
      // 5.1. Гіперзвуковий ударний плазмовий кокон (Mach 10 іонізація повітря)
      const shockCone = ctx.createRadialGradient(28, 0, 2, -10, 0, 48);
      shockCone.addColorStop(0, 'rgba(56, 189, 248, 0.95)'); // Неоново-блакитна іонізація
      shockCone.addColorStop(0.35, 'rgba(239, 68, 68, 0.75)'); // Високотемпературне гальмування
      shockCone.addColorStop(0.75, 'rgba(249, 115, 22, 0.4)');
      shockCone.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = shockCone;
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(-36, -26);
      ctx.lineTo(-36, 26);
      ctx.closePath();
      ctx.fill();

      // 5.2. Стрілоподібні хвостові керма та обтічники приводів
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-24, -5.5);
      ctx.lineTo(-34, -15);
      ctx.lineTo(-38, -14);
      ctx.lineTo(-34, -5.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-24, 5.5);
      ctx.lineTo(-34, 15);
      ctx.lineTo(-38, 14);
      ctx.lineTo(-34, 5.5);
      ctx.closePath();
      ctx.fill();

      // 5.3. Стрілоподібний термозахисний корпус (характерний біло-титановий захист)
      const kinzhalGrad = ctx.createLinearGradient(0, -6, 0, 6);
      kinzhalGrad.addColorStop(0, '#ffffff');
      kinzhalGrad.addColorStop(0.3, '#f1f5f9');
      kinzhalGrad.addColorStop(0.7, '#cbd5e1');
      kinzhalGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = kinzhalGrad;

      ctx.beginPath();
      ctx.moveTo(42, 0); // Початок гострого конуса
      ctx.lineTo(16, -5.5);
      ctx.lineTo(-34, -5.5);
      ctx.lineTo(-34, 5.5);
      ctx.lineTo(16, 5.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Голка приймача повітряного тиску (ПВД) та ударної хвилі на вістрі
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(48, 0);
      ctx.stroke();

      // Термостійкий титаново-карбідний ковпак носової частини
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(34, -2.5);
      ctx.lineTo(34, 2.5);
      ctx.closePath();
      ctx.fill();

      // Маркувальні червоні смуги та шов відокремлення ступеня
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(16, -5.5);
      ctx.lineTo(16, 5.5);
      ctx.stroke();

      // 5.4. Сопловий блок та надзвуковий факел з дисками Маха
      const machFlame = ctx.createLinearGradient(-34, 0, -65, 0);
      machFlame.addColorStop(0, '#ffffff');
      machFlame.addColorStop(0.2, '#fde047');
      machFlame.addColorStop(0.6, '#f97316');
      machFlame.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = machFlame;
      ctx.beginPath();
      ctx.moveTo(-34, -4);
      ctx.lineTo(-65, 0);
      ctx.lineTo(-34, 4);
      ctx.closePath();
      ctx.fill();

      // Диски Маха (надзвукові стрибки ущільнення в полум'ї)
      ctx.fillStyle = '#ffffff';
      [-40, -47, -54].forEach((mx) => {
        ctx.beginPath();
        ctx.ellipse(mx, 0, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (target.type === 'iskander') {
      // 6. ІСКАНДЕР-М (9М723): Квазібалістична твердопаливна ракета
      // 6.1. Хвостові ґратчасті/трапецієподібні рулі та газодинамічні керма
      ctx.fillStyle = '#334155';
      // Верхнє основне аеродинамічне кермо
      ctx.beginPath();
      ctx.moveTo(-22, -6.5);
      ctx.lineTo(-32, -16);
      ctx.lineTo(-36, -15);
      ctx.lineTo(-36, -6.5);
      ctx.closePath();
      ctx.fill();
      // Нижнє аеродинамічне кермо
      ctx.beginPath();
      ctx.moveTo(-22, 6.5);
      ctx.lineTo(-32, 16);
      ctx.lineTo(-36, 15);
      ctx.lineTo(-36, 6.5);
      ctx.closePath();
      ctx.fill();

      // 4 носових газодинамічних дестабілізатора/руля біля бойової частини
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, -10, 4, 3.5);
      ctx.fillRect(8, 6.5, 4, 3.5);

      // 6.2. Масивний циліндричний корпус у темно-оливному захисному камуфляжі
      const iskGrad = ctx.createLinearGradient(0, -7, 0, 7);
      if (isLit) {
        iskGrad.addColorStop(0, '#475569');
        iskGrad.addColorStop(0.3, '#334155');
        iskGrad.addColorStop(0.7, '#1e293b');
        iskGrad.addColorStop(1, '#0f172a');
      } else {
        iskGrad.addColorStop(0, '#334155');
        iskGrad.addColorStop(0.5, '#1e293b');
        iskGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = iskGrad;

      // Оживальна бойова частина та циліндричний ракетний двигун
      ctx.beginPath();
      ctx.moveTo(36, 0); // Вістря бойової частини
      ctx.lineTo(14, -6.5);
      ctx.lineTo(-36, -6.5);
      ctx.lineTo(-36, 6.5);
      ctx.lineTo(14, 6.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isLit ? '#64748b' : '#334155';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Носова голка аеродинамічного датчика
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(36, 0);
      ctx.lineTo(42, 0);
      ctx.stroke();

      // Шов відокремлення бойової частини (радіоконтрастна смуга)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(14, -6.5);
      ctx.lineTo(14, 6.5);
      ctx.stroke();

      // Кабельний гаргрот вздовж корпусу
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-28, -7.5, 38, 1.2);

      // 6.3. Потужний твердопаливний факел змішаного палива
      const iskFlame = ctx.createRadialGradient(-36, 0, 3, -65, 0, 35);
      iskFlame.addColorStop(0, '#ffffff');
      iskFlame.addColorStop(0.25, '#fbbf24');
      iskFlame.addColorStop(0.65, '#f97316');
      iskFlame.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = iskFlame;
      ctx.beginPath();
      ctx.moveTo(-36, -5);
      ctx.lineTo(-65, 0);
      ctx.lineTo(-36, 5);
      ctx.closePath();
      ctx.fill();

      // Іскри та димові частинки твердого палива
      ctx.fillStyle = '#fef08a';
      [-42, -50, -58].forEach((fx, i) => {
        ctx.beginPath();
        ctx.arc(fx, (i % 2 === 0 ? 1 : -1) * 2, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (target.type === 'oreshnik_boss') {
      // 7. ОРЕШНИК: ФІНАЛЬНИЙ БОС (Масивна БРСД з бойовими блоками MIRV)
      // 7.1. Катастрофічний гіперзвуковий плазмовий кокон входження в атмосферу (Mach 12-15)
      const bossPlasma = ctx.createRadialGradient(20, 0, 10, -25, 0, 85);
      bossPlasma.addColorStop(0, 'rgba(255, 255, 255, 0.98)'); // Сліпуче біле ядро
      bossPlasma.addColorStop(0.25, 'rgba(249, 115, 22, 0.9)');
      bossPlasma.addColorStop(0.55, 'rgba(168, 85, 247, 0.7)'); // Іонізація азоту фіолетовим
      bossPlasma.addColorStop(0.8, 'rgba(220, 38, 38, 0.45)');
      bossPlasma.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = bossPlasma;
      ctx.beginPath();
      ctx.arc(-10, 0, 75, 0, Math.PI * 2);
      ctx.fill();

      // 7.2. Масивний корпус балістичної ракети середньої дальності (БРСД)
      const isMirvExposed = (target.bossPhase && target.bossPhase >= 2) || (target.health < target.maxHealth * 0.65);

      // Основний циліндр важких ступенів ракети
      const oreshnikGrad = ctx.createLinearGradient(0, -11, 0, 11);
      oreshnikGrad.addColorStop(0, '#52525b');
      oreshnikGrad.addColorStop(0.2, '#27272a');
      oreshnikGrad.addColorStop(0.8, '#18181b');
      oreshnikGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = oreshnikGrad;

      ctx.beginPath();
      ctx.moveTo(52, 0); // Головний обтічник
      ctx.lineTo(24, -11);
      ctx.lineTo(-48, -11);
      ctx.lineTo(-48, 11);
      ctx.lineTo(24, 11);
      ctx.closePath();
      ctx.fill();

      // Титанові мікрошви та кільця міжступеневого з'єднання
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1.5;
      [-26, 0, 24].forEach((rx) => {
        ctx.beginPath();
        ctx.moveTo(rx, -11);
        ctx.lineTo(rx, 11);
        ctx.stroke();
      });

      // Бічні верньєрні рульові двигуни РКС (Reaction Control Thrusters)
      ctx.fillStyle = '#38bdf8';
      [-10, 15].forEach((vx) => {
        ctx.beginPath();
        ctx.arc(vx, -11.5, 2.5, 0, Math.PI * 2);
        ctx.arc(vx, 11.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7.3. РОЗДІЛЮВАНА ГОЛОВНА ЧАСТИНА (MIRV) - 6 БОЙОВИХ БЛОКІВ
      if (isMirvExposed) {
        // Ступінь розведення відкрито: 6 індивідуальних бойових блоків з власними факелами плазми!
        const warheadOffsets = [-7, -4, -1, 2, 5, 8];
        warheadOffsets.forEach((wy, idx) => {
          // Конус бойового блоку
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(54, wy);
          ctx.lineTo(36, wy - 2);
          ctx.lineTo(36, wy + 2);
          ctx.closePath();
          ctx.fill();

          // Індивідуальний плазмовий струмінь бойового блоку (як на відео удару по Дніпру!)
          ctx.fillStyle = idx % 2 === 0 ? '#38bdf8' : '#f97316';
          ctx.beginPath();
          ctx.moveTo(36, wy);
          ctx.lineTo(15, wy + (Math.sin(time * 0.02 + idx) * 1.5));
          ctx.stroke();
        });

        // Індикатор розділення MIRV
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText('MIRV CLUSTER ACTIVE [6 BLOCKS]', -30, -18);
      } else {
        // Захисний аеродинамічний обтічник бойових блоків
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(52, 0);
        ctx.lineTo(24, -10);
        ctx.lineTo(24, 10);
        ctx.closePath();
        ctx.fill();

        // Поздовжні піропатронні лінії розкриття стулок обтічника
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(52, 0);
        ctx.lineTo(24, 0);
        ctx.stroke();
      }

      // 7.4. Багатокамерний термодинамічний ревучий хвостовий факел
      const bossThrust = ctx.createLinearGradient(-48, 0, -85, 0);
      bossThrust.addColorStop(0, '#ffffff');
      bossThrust.addColorStop(0.3, '#f59e0b');
      bossThrust.addColorStop(0.7, '#ea580c');
      bossThrust.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = bossThrust;
      ctx.beginPath();
      ctx.moveTo(-48, -9);
      ctx.lineTo(-85, 0);
      ctx.lineTo(-48, 9);
      ctx.closePath();
      ctx.fill();
    } else if (target.type === 'zircon') {
      // 8. 3М22 «ЦИРКОН»: Гіперзвукова крилата ракета з прямоточним ГППРД (3 стадія)
      // Гіперзвуковий плазмовий кокон хвильового перехоплення (Mach 8-9)
      const zirconPlasma = ctx.createRadialGradient(24, 0, 3, -12, 0, 48);
      zirconPlasma.addColorStop(0, 'rgba(56, 189, 248, 0.95)'); // Неонова іонізація
      zirconPlasma.addColorStop(0.3, 'rgba(249, 115, 22, 0.85)'); // Високотемпературне гальмування
      zirconPlasma.addColorStop(0.75, 'rgba(239, 68, 68, 0.4)');
      zirconPlasma.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = zirconPlasma;
      ctx.beginPath();
      ctx.moveTo(45, 0);
      ctx.lineTo(-36, -22);
      ctx.lineTo(-36, 22);
      ctx.closePath();
      ctx.fill();

      // Клиноподібний Waverider фюзеляж (стелс-клин для хвильового ковзання)
      const zGrad = ctx.createLinearGradient(0, -5, 0, 5);
      zGrad.addColorStop(0, '#e2e8f0');
      zGrad.addColorStop(0.3, '#cbd5e1');
      zGrad.addColorStop(0.7, '#64748b');
      zGrad.addColorStop(1, '#334155');
      ctx.fillStyle = zGrad;

      // Клиноподібна гостра носова кромка та корпус
      ctx.beginPath();
      ctx.moveTo(38, 0); // Долотоподібний ніс
      ctx.lineTo(16, -5);
      ctx.lineTo(-32, -5);
      ctx.lineTo(-32, 5);
      ctx.lineTo(16, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Підфюзеляжний надзвуковий повітрозабірник ГППРД (Scramjet intake)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(12, 2.5);
      ctx.lineTo(-4, 7);
      ctx.lineTo(-14, 7);
      ctx.lineTo(-6, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Хвостові аеродинамічні керма блоку розгону
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-22, -5);
      ctx.lineTo(-32, -14);
      ctx.lineTo(-36, -13);
      ctx.lineTo(-32, -5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-22, 5);
      ctx.lineTo(-32, 14);
      ctx.lineTo(-36, 13);
      ctx.lineTo(-32, 5);
      ctx.closePath();
      ctx.fill();

      // Прямоточний гіперзвуковий факел з дисками Маха
      const zFlame = ctx.createLinearGradient(-32, 0, -60, 0);
      zFlame.addColorStop(0, '#ffffff');
      zFlame.addColorStop(0.2, '#38bdf8');
      zFlame.addColorStop(0.6, '#f97316');
      zFlame.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = zFlame;
      ctx.beginPath();
      ctx.moveTo(-32, -3.5);
      ctx.lineTo(-60, 0);
      ctx.lineTo(-32, 3.5);
      ctx.closePath();
      ctx.fill();

      // Диски Маха
      ctx.fillStyle = '#ffffff';
      [-38, -45, -52].forEach((mx) => {
        ctx.beginPath();
        ctx.ellipse(mx, 0, 1.8, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (target.type === 'banderol') {
      // 9. «БАНДЕРОЛЬ»: Швидкісний маневровий дрон доставки з бойовою частиною (3-4 стадія)
      // Качине аеродинамічне оперення: переднє дестабілізуюче крило (канарди)
      ctx.fillStyle = isLit ? '#64748b' : '#334155';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(6, -9);
      ctx.lineTo(3, -9);
      ctx.lineTo(6, 0);
      ctx.lineTo(3, 9);
      ctx.lineTo(6, 9);
      ctx.closePath();
      ctx.fill();

      // Основне крило середнього розташування
      ctx.beginPath();
      ctx.moveTo(2, -2);
      ctx.lineTo(-6, -20);
      ctx.lineTo(-10, -20);
      ctx.lineTo(-5, -2);
      ctx.lineTo(-5, 2);
      ctx.lineTo(-10, 20);
      ctx.lineTo(-6, 20);
      ctx.lineTo(2, 2);
      ctx.closePath();
      ctx.fillStyle = isLit ? '#475569' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Циліндричний композитний фюзеляж
      ctx.fillStyle = isLit ? '#334155' : '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Підвісний контейнер бойової частини «Бандеролі»
      ctx.fillStyle = isLit ? '#15803d' : '#166534';
      ctx.fillRect(-6, 2.5, 12, 3.5);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-6, 2.5, 12, 3.5);

      // Задній штовхаючий гвинт (розмиття пропелера)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-16, 0, 1.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Трасерний слід
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-16, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // HUD Target Bracket
    ctx.save();
    const isBoss = target.isBoss;
    ctx.strokeStyle = isBoss ? '#ef4444' : isLit ? '#38bdf8' : 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = isBoss ? 2 : 1;
    const boxSize = (isBoss ? 28 : 16) * scale;
    ctx.strokeRect(target.x - boxSize, target.y - boxSize, boxSize * 2, boxSize * 2);

    ctx.fillStyle = isBoss ? '#f87171' : isLit ? '#38bdf8' : '#94a3b8';
    ctx.font = isBoss ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
    const localizedName = getTargetName(target.type, target.name);
    ctx.fillText(`${localizedName}`, target.x - boxSize, target.y - boxSize - 5);
    ctx.fillText(`${Math.round(target.distance)}m · ${Math.round(target.speed)}${t.kmh}`, target.x - boxSize, target.y + boxSize + 13);
    ctx.restore();
  };

  // --- DRAW TARGET: THERMAL FLIR ---
  const drawTargetThermal = (ctx: CanvasRenderingContext2D, target: TargetThreat, time: number) => {
    ctx.save();
    ctx.translate(target.x, target.y);

    const angle = Math.atan2(target.vy, target.vx);
    ctx.rotate(angle);

    const scale = Math.max(0.7, Math.min(2.8, (4500 / target.distance) * target.size));
    ctx.scale(scale, scale);

    // Специфічний тепловий силует для кожного типу загрози в інфрачервоному сенсорі
    if (target.type === 'fpv') {
      // 4 гарячі електромотори + акумулятор
      ctx.fillStyle = 'rgba(20, 83, 45, 0.5)';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.fillStyle = '#ffffff';
      [[-8, -8], [8, -8], [-8, 8], [8, 8]].forEach(([mx, my]) => {
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (target.type === 'geran2' || target.type === 'gerbera') {
      // Холодний планер + розпечений поршневий двигун MD-550 позаду
      ctx.fillStyle = 'rgba(20, 83, 45, 0.6)';
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, -18);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 18);
      ctx.closePath();
      ctx.fill();

      // Гаряча головка циліндра та вихлопний колектор
      const engHeat = ctx.createRadialGradient(-10, 0, 1, -10, 0, 10);
      engHeat.addColorStop(0, '#ffffff');
      engHeat.addColorStop(0.4, '#86efac');
      engHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = engHeat;
      ctx.beginPath();
      ctx.arc(-10, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'geran4_seeker') {
      // Реактивне сопло та турбіна
      ctx.fillStyle = 'rgba(20, 83, 45, 0.7)';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-16, -19);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-16, 19);
      ctx.closePath();
      ctx.fill();

      const jetHeat = ctx.createRadialGradient(-14, 0, 1, -18, 0, 16);
      jetHeat.addColorStop(0, '#ffffff');
      jetHeat.addColorStop(0.5, '#4ade80');
      jetHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = jetHeat;
      ctx.beginPath();
      ctx.arc(-16, 0, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'kh101_kalibr') {
      // Х-101: Характерна інфрачервона сигнатура підфюзеляжного двигуна ТРДД-50А
      ctx.fillStyle = 'rgba(20, 83, 45, 0.7)';
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(-28, -3.5);
      ctx.lineTo(-28, 3.5);
      ctx.closePath();
      ctx.fill();

      // Крила
      ctx.fillRect(-2, -24, 4, 48);

      // Підвісний двигун ТРДД-50А: біло-гаряче сопло та вихлоп
      const khHeat = ctx.createRadialGradient(-20, 6, 1, -20, 6, 15);
      khHeat.addColorStop(0, '#ffffff');
      khHeat.addColorStop(0.35, '#86efac');
      khHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = khHeat;
      ctx.beginPath();
      ctx.arc(-20, 6, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'iskander') {
      // Іскандер: Теплова сигнатура твердопаливного двигуна та гальмування носа
      ctx.fillStyle = 'rgba(20, 83, 45, 0.8)';
      ctx.beginPath();
      ctx.moveTo(34, 0);
      ctx.lineTo(-34, -6.5);
      ctx.lineTo(-34, 6.5);
      ctx.closePath();
      ctx.fill();

      // Сопло ракетного двигуна
      const iskHeat = ctx.createRadialGradient(-34, 0, 2, -34, 0, 26);
      iskHeat.addColorStop(0, '#ffffff');
      iskHeat.addColorStop(0.4, '#86efac');
      iskHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = iskHeat;
      ctx.beginPath();
      ctx.arc(-34, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Аеродинамічний розігрів носового конуса
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(32, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'kinzhal') {
      // Кинджал: Весь корпус розпечений гіперзвуковим тертям Mach 10
      ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(-34, -5.5);
      ctx.lineTo(-34, 5.5);
      ctx.closePath();
      ctx.fill();

      // Сліпуче біла носова голка та передня кромка
      const kinzhalHeat = ctx.createRadialGradient(38, 0, 1, 38, 0, 18);
      kinzhalHeat.addColorStop(0, '#ffffff');
      kinzhalHeat.addColorStop(0.5, '#bbf7d0');
      kinzhalHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = kinzhalHeat;
      ctx.beginPath();
      ctx.arc(38, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Сопло
      const kinzhalTail = ctx.createRadialGradient(-34, 0, 2, -34, 0, 24);
      kinzhalTail.addColorStop(0, '#ffffff');
      kinzhalTail.addColorStop(0.4, '#86efac');
      kinzhalTail.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = kinzhalTail;
      ctx.beginPath();
      ctx.arc(-34, 0, 24, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'oreshnik_boss') {
      // ОРЕШНИК: Гігантський тепловий засвіт, що засліплює сенсор FLIR
      const bossHeat = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
      bossHeat.addColorStop(0, '#ffffff');
      bossHeat.addColorStop(0.3, '#bbf7d0');
      bossHeat.addColorStop(0.7, '#22c55e');
      bossHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = bossHeat;
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.fill();

      // 6 яскравих точок бойових блоків MIRV
      ctx.fillStyle = '#ffffff';
      [-8, -5, -2, 1, 4, 7].forEach((by) => {
        ctx.beginPath();
        ctx.arc(35, by, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (target.type === 'geran5_seeker') {
      // Герань-5: Два гарячі реактивні сопла + тепла оптична ГСН на носі
      ctx.fillStyle = 'rgba(20, 83, 45, 0.7)';
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(-18, -24);
      ctx.lineTo(-15, 0);
      ctx.lineTo(-18, 24);
      ctx.closePath();
      ctx.fill();

      // Подвійні біло-гарячі ядра реактивних турбін
      [-5, 5].forEach((ey) => {
        const jetHeat = ctx.createRadialGradient(-12, ey, 1, -16, ey, 14);
        jetHeat.addColorStop(0, '#ffffff');
        jetHeat.addColorStop(0.5, '#4ade80');
        jetHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = jetHeat;
        ctx.beginPath();
        ctx.arc(-14, ey, 12, 0, Math.PI * 2);
        ctx.fill();
      });

      // Тепла куля оптичної ГСН
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(21, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'zircon') {
      // 3М22 Циркон: Колосальний гіперзвуковий аеродинамічний розігрів долота та ГППРД
      ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.lineTo(-32, -5);
      ctx.lineTo(-32, 5);
      ctx.closePath();
      ctx.fill();

      // Сліпуче біла долотоподібна носова кромка
      const zNoseHeat = ctx.createRadialGradient(34, 0, 1, 34, 0, 16);
      zNoseHeat.addColorStop(0, '#ffffff');
      zNoseHeat.addColorStop(0.4, '#bbf7d0');
      zNoseHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = zNoseHeat;
      ctx.beginPath();
      ctx.arc(34, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Гаряче прямоточне сопло ГППРД
      const zTailHeat = ctx.createRadialGradient(-32, 0, 2, -32, 0, 26);
      zTailHeat.addColorStop(0, '#ffffff');
      zTailHeat.addColorStop(0.5, '#86efac');
      zTailHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = zTailHeat;
      ctx.beginPath();
      ctx.arc(-32, 0, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (target.type === 'banderol') {
      // Бандероль: Компактна тепла задня мотогондола та бойовий модуль
      ctx.fillStyle = 'rgba(20, 83, 45, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Гарячий штовхаючий двигун
      const bHeat = ctx.createRadialGradient(-16, 0, 1, -16, 0, 10);
      bHeat.addColorStop(0, '#ffffff');
      bHeat.addColorStop(0.4, '#86efac');
      bHeat.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = bHeat;
      ctx.beginPath();
      ctx.arc(-16, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    ctx.save();
    ctx.strokeStyle = target.isBoss ? '#ef4444' : '#22c55e';
    ctx.lineWidth = target.isBoss ? 2 : 1.5;
    const b = (target.isBoss ? 30 : 18) * scale;
    ctx.strokeRect(target.x - b, target.y - b, b * 2, b * 2);

    ctx.fillStyle = '#4ade80';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`TRK: ${target.callsign}`, target.x - b, target.y - b - 6);
    ctx.fillText(`H: ${Math.round(target.altitude)}m · R: ${Math.round(target.distance)}m`, target.x - b, target.y + b + 14);
    ctx.restore();
  };

  // --- DRAW TARGET: RADAR PPI ---
  const drawTargetRadar = (ctx: CanvasRenderingContext2D, target: TargetThreat) => {
    ctx.save();
    ctx.fillStyle = target.isBoss ? '#ef4444' : target.threatLevel === 'critical' ? '#f87171' : target.type === 'fpv' || target.type === 'banderol' ? '#38bdf8' : '#22c55e';
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.isBoss ? 7 : 4, 0, Math.PI * 2);
    ctx.fill();

    // Velocity vector line
    ctx.strokeStyle = target.isBoss ? '#ef4444' : '#4ade80';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(target.x, target.y);
    ctx.lineTo(target.x + target.vx * 0.25, target.y + target.vy * 0.25);
    ctx.stroke();

    // Detailed Radar IFF code
    const typeTag =
      target.type === 'kh101_kalibr'
        ? 'KH-101 [CRUISE MISSILE]'
        : target.type === 'iskander'
        ? '9M723 [BALLISTIC OTRK]'
        : target.type === 'kinzhal'
        ? 'KH-47M2 [HYPERSONIC M10+]'
        : target.type === 'zircon'
        ? '3M22 [HYPERSONIC SCRAMJET M8+]'
        : target.type === 'oreshnik_boss'
        ? 'ORESHNIK [IRBM / MIRV 6x]'
        : target.type === 'geran5_seeker'
        ? 'GERAN-5 [TWIN-JET SEEKER]'
        : target.type === 'geran4_seeker'
        ? 'GERAN-4 [JET UAV]'
        : target.type === 'banderol'
        ? 'BANDEROL [FAST ATTACK UAV]'
        : target.type === 'geran2'
        ? 'SHAHED-136 [UAV]'
        : target.type === 'gerbera'
        ? 'GERBERA [DECOY UAV]'
        : 'FPV [KAMIKAZE DRONE]';

    ctx.fillStyle = target.isBoss ? '#f87171' : '#86efac';
    ctx.font = target.isBoss ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
    ctx.fillText(`${target.callsign} · ${typeTag}`, target.x + 8, target.y - 4);
    ctx.fillText(`ALT: ${Math.round(target.altitude)}m · SPD: ${Math.round(target.speed)}KM/H`, target.x + 8, target.y + 8);
    ctx.restore();
  };

  const drawProjectiles = (ctx: CanvasRenderingContext2D, isThermal: boolean, isRadar: boolean = false) => {
    ctx.save();
    for (const p of simulation.projectiles) {
      if (p.weapon === 'browning' || p.weapon === 'gepard') {
        const len = p.weapon === 'gepard' ? 24 : 16;
        const speed = Math.hypot(p.vx, p.vy);
        const nx = p.vx / speed;
        const ny = p.vy / speed;

        ctx.strokeStyle = isThermal ? '#ffffff' : isRadar ? '#4ade80' : p.color;
        ctx.lineWidth = p.weapon === 'gepard' ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - nx * len, p.y - ny * len);
        ctx.stroke();
      } else {
        ctx.fillStyle = isThermal ? '#ffffff' : isRadar ? '#38bdf8' : p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.weapon === 'patriot' ? 4.5 : 3.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, isThermal: boolean) => {
    ctx.save();
    for (const pt of simulation.particles) {
      ctx.globalAlpha = pt.alpha;
      if (pt.type === 'shockwave') {
        ctx.strokeStyle = isThermal ? '#86efac' : pt.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (pt.type === 'smoke') {
        ctx.fillStyle = isThermal ? 'rgba(34, 197, 94, 0.2)' : pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = isThermal ? '#ffffff' : pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  const renderTacticalReticle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const cx = crosshairPos.x;
    const cy = crosshairPos.y;
    const currentWeapon = simulation.currentWeapon;
    const config = WEAPON_CONFIGS[currentWeapon];

    ctx.save();

    if (showLeadAid) {
      for (const t of simulation.targets) {
        if (!t.destroyed) {
          const lead = simulation.getLeadPoint(t, currentWeapon, w, h);
          if (lead) {
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(lead.x, lead.y, 11, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(lead.x, lead.y, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(lead.x, lead.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    }

    if (config.lockRequired) {
      const lockState = simulation.lockState;
      const progress = simulation.lockProgress;

      ctx.strokeStyle =
        lockState === 'locked' ? '#ef4444' : lockState === 'acquiring' ? '#f59e0b' : 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;

      const size = 32 - progress * 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = lockState === 'locked' ? '#ef4444' : '#f59e0b';
      ctx.font = '11px "JetBrains Mono", monospace';
      const text =
        lockState === 'locked'
          ? 'LOCK ACQUIRED — READY TO FIRE'
          : lockState === 'acquiring'
          ? `LOCKING... ${Math.round(progress * 100)}%`
          : 'SEEKER ACTIVE — HOLD ON TARGET';
      ctx.fillText(text, cx - 80, cy + size + 20);
    }

    const isThermal = visionMode === 'thermal';
    const isRadar = visionMode === 'radar';
    const retColor = isThermal ? '#4ade80' : isRadar ? '#86efac' : '#38bdf8';

    ctx.strokeStyle = retColor;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 38, cy);
    ctx.lineTo(cx - 26, cy);
    ctx.moveTo(cx + 26, cy);
    ctx.lineTo(cx + 38, cy);
    ctx.moveTo(cx, cy - 38);
    ctx.lineTo(cx, cy - 26);
    ctx.moveTo(cx, cy + 26);
    ctx.lineTo(cx, cy + 38);
    ctx.stroke();

    ctx.fillStyle = retColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
    />
  );
};
