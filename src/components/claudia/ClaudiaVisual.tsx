import { useEffect, useRef } from "react";

export type ClaudiaVisualState = "idle" | "listening" | "speaking" | "executing";

export interface ClaudiaDomain {
  key: string;
  label: string;
  count: number;
  color: string;
}

export const CLAUDIA_DOMAINS: ClaudiaDomain[] = [
  { key: "skills", label: "Skills", count: 219, color: "hsl(30, 75%, 60%)" },
  { key: "clientes", label: "Clientes", count: 139, color: "hsl(190, 55%, 60%)" },
  { key: "conteudo", label: "Conteúdo", count: 114, color: "hsl(175, 45%, 55%)" },
  { key: "ferramentas", label: "Ferramentas", count: 249, color: "hsl(205, 60%, 62%)" },
  { key: "rotina", label: "Rotina", count: 61, color: "hsl(45, 80%, 62%)" },
  { key: "memoria", label: "Memória", count: 324, color: "hsl(160, 40%, 55%)" },
];

interface ClaudiaVisualProps {
  state: ClaudiaVisualState;
  activeDomain: string | null;
}

export function ClaudiaVisual({ state, activeDomain }: ClaudiaVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const activeDomainRef = useRef(activeDomain);
  stateRef.current = state;
  activeDomainRef.current = activeDomain;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const dotsPerDomain = CLAUDIA_DOMAINS.map((d) => Math.max(10, Math.min(48, Math.round(d.count / 6))));

    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.32;

      ctx.clearRect(0, 0, width, height);

      const currentState = stateRef.current;
      const active = activeDomainRef.current;

      const pulseSpeed = currentState === "listening" ? 2.6 : currentState === "speaking" ? 4.2 : currentState === "executing" ? 3.4 : 1;
      const pulseAmp = currentState === "idle" ? 3 : currentState === "listening" ? 7 : currentState === "speaking" ? 10 : 8;
      const corePulse = Math.sin(t * pulseSpeed) * pulseAmp;
      const coreRadius = 26 + corePulse;

      // outer thin guide rings
      ctx.strokeStyle = "rgba(210, 190, 150, 0.12)";
      ctx.lineWidth = 1;
      [baseRadius * 0.62, baseRadius * 1.05].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // domain arcs of dots around the core
      const segAngle = (Math.PI * 2) / CLAUDIA_DOMAINS.length;
      CLAUDIA_DOMAINS.forEach((domain, i) => {
        const isActive = active === domain.key;
        const startAngle = i * segAngle - Math.PI / 2;
        const dots = dotsPerDomain[i];
        const ringR = baseRadius * 0.62;

        for (let d = 0; d < dots; d++) {
          const frac = d / dots;
          const angle = startAngle + frac * segAngle * 0.86 + segAngle * 0.07;
          const wobble = Math.sin(t * 0.8 + d * 0.5 + i) * 4;
          const r = ringR - 18 + (d % 3) * 10 + wobble;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const glow = isActive ? 0.95 : 0.45;
          const size = isActive ? 2.4 : 1.6;
          ctx.beginPath();
          ctx.fillStyle = domain.color.replace(")", `, ${glow})`).replace("hsl", "hsla");
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // outer node marker for the domain (hexagon-ish dot with label anchor)
        const outerAngle = startAngle + segAngle / 2;
        const outerR = baseRadius * 1.05;
        const ox = cx + Math.cos(outerAngle) * outerR;
        const oy = cy + Math.sin(outerAngle) * outerR;
        const nodePulse = isActive ? Math.abs(Math.sin(t * 5)) * 4 : 0;

        ctx.beginPath();
        ctx.fillStyle = isActive ? domain.color : "rgba(210, 190, 150, 0.35)";
        ctx.shadowColor = isActive ? domain.color : "transparent";
        ctx.shadowBlur = isActive ? 18 : 0;
        ctx.arc(ox, oy, 5 + nodePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = "12px 'IBM Plex Mono', monospace";
        ctx.fillStyle = isActive ? domain.color : "rgba(230, 220, 200, 0.55)";
        ctx.textAlign = outerAngle > Math.PI / 2 && outerAngle < (3 * Math.PI) / 2 ? "right" : "left";
        const labelOffset = ctx.textAlign === "right" ? -12 : 12;
        ctx.fillText(`${domain.label} · ${domain.count}`, ox + labelOffset, oy + 4);
      });

      // spinning inner particles feeding the core
      const innerDots = 90;
      for (let d = 0; d < innerDots; d++) {
        const frac = d / innerDots;
        const angle = frac * Math.PI * 2 + t * (currentState === "idle" ? 0.15 : 0.4);
        const spiral = (frac * 0.7 + 0.15) * (baseRadius * 0.5);
        const x = cx + Math.cos(angle) * spiral;
        const y = cy + Math.sin(angle) * spiral * 0.94;
        ctx.beginPath();
        ctx.fillStyle = "rgba(180, 220, 210, 0.5)";
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // core glow
      const coreColor = currentState === "listening"
        ? "45, 90%, 62%"
        : currentState === "speaking"
        ? "38, 85%, 60%"
        : currentState === "executing"
        ? "190, 60%, 60%"
        : "42, 60%, 55%";

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.6);
      gradient.addColorStop(0, `hsla(${coreColor}, 0.9)`);
      gradient.addColorStop(0.4, `hsla(${coreColor}, 0.35)`);
      gradient.addColorStop(1, `hsla(${coreColor}, 0)`);
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(cx, cy, coreRadius * 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `hsla(${coreColor}, 0.95)`;
      ctx.arc(cx, cy, coreRadius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />;
}
