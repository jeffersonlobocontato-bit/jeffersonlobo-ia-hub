import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface Props {
  imageUrl: string;
  focalX: number;
  focalY: number;
  zoom: number;
  onChange: (next: { focal_x: number; focal_y: number; zoom: number }) => void;
}

/**
 * Editor visual de crop:
 * - Arraste sobre a imagem para reposicionar o ponto focal
 * - Use o scroll do mouse, slider ou +/- para zoom (1x a 4x)
 * - O preview reflete exatamente como a foto será exibida no site
 */
export const StagePhotoCropEditor = ({ imageUrl, focalX, focalY, zoom, onChange }: Props) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  const updateFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const x = clamp(((clientX - box.left) / box.width) * 100);
      const y = clamp(((clientY - box.top) / box.height) * 100);
      onChange({ focal_x: x, focal_y: y, zoom });
    },
    [onChange, zoom]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromEvent(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromEvent(e.clientX, e.clientY);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = clamp(zoom + (e.deltaY < 0 ? 0.1 : -0.1), 1, 4);
    onChange({ focal_x: focalX, focal_y: focalY, zoom: Number(next.toFixed(2)) });
  };

  if (!imageUrl) {
    return (
      <div className="border border-dashed border-border h-40 flex items-center justify-center text-xs text-muted-foreground">
        Envie uma imagem primeiro para ajustar o crop.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
          <Move className="w-3 h-3" /> Ajuste de crop
        </div>
        <div className="text-[10px] text-muted-foreground">
          {Math.round(focalX)}% · {Math.round(focalY)}% · {zoom.toFixed(2)}x
        </div>
      </div>

      {/* Preview com mesma proporção do card destaque do site (5:3 aprox.) */}
      <div
        ref={boxRef}
        className={`relative w-full aspect-[5/3] overflow-hidden border border-border bg-black select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt="Pré-visualização do crop"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{
            objectPosition: `${focalX}% ${focalY}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${focalX}% ${focalY}%`,
          }}
        />
        {/* Crosshair do ponto focal */}
        <div
          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
        >
          <div className="absolute inset-0 border-2 border-primary rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute left-1/2 top-1/2 w-0.5 h-3 -translate-x-1/2 -translate-y-1/2 bg-primary" />
          <div className="absolute left-1/2 top-1/2 h-0.5 w-3 -translate-x-1/2 -translate-y-1/2 bg-primary" />
        </div>
        {/* Degradê para conferir legibilidade da legenda */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 via-30% to-transparent" />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() =>
            onChange({ focal_x: focalX, focal_y: focalY, zoom: Number(clamp(zoom - 0.1, 1, 4).toFixed(2)) })
          }
        >
          <ZoomOut className="w-3 h-3" />
        </Button>
        <Slider
          value={[zoom]}
          min={1}
          max={4}
          step={0.05}
          onValueChange={(v) => onChange({ focal_x: focalX, focal_y: focalY, zoom: Number(v[0].toFixed(2)) })}
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() =>
            onChange({ focal_x: focalX, focal_y: focalY, zoom: Number(clamp(zoom + 0.1, 1, 4).toFixed(2)) })
          }
        >
          <ZoomIn className="w-3 h-3" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange({ focal_x: 50, focal_y: 50, zoom: 1 })}
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Resetar
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Arraste sobre a imagem para mover o foco. Use o scroll do mouse ou o slider para dar zoom.
      </p>
    </div>
  );
};
