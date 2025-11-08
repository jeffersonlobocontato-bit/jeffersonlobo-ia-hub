import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeatmapProps {
  pagePath: string;
  period: number;
}

interface ClickPoint {
  x: number;
  y: number;
  count: number;
}

export const Heatmap = ({ pagePath, period }: HeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClickData();
  }, [pagePath, period]);

  const loadClickData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const { data } = await supabase
        .from('click_events')
        .select('x_position, y_position')
        .eq('page_path', pagePath)
        .gte('created_at', startDate.toISOString());

      if (data) {
        // Group clicks by position (with small tolerance for clustering)
        const clickMap = new Map<string, number>();
        data.forEach(click => {
          // Round to nearest 10px for clustering
          const x = Math.round(click.x_position / 10) * 10;
          const y = Math.round(click.y_position / 10) * 10;
          const key = `${x},${y}`;
          clickMap.set(key, (clickMap.get(key) || 0) + 1);
        });

        const points: ClickPoint[] = Array.from(clickMap.entries()).map(([key, count]) => {
          const [x, y] = key.split(',').map(Number);
          return { x, y, count };
        });

        setClickPoints(points);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de cliques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || clickPoints.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 2000;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find max count for normalization
    const maxCount = Math.max(...clickPoints.map(p => p.count));

    // Draw heatmap
    clickPoints.forEach(point => {
      const intensity = point.count / maxCount;
      const radius = 30 + (intensity * 40); // Larger circles for more clicks

      // Create gradient
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      
      // Color scale: blue -> green -> yellow -> red
      let color;
      if (intensity < 0.25) {
        color = `rgba(0, 0, 255, ${0.2 + intensity * 0.8})`;
      } else if (intensity < 0.5) {
        color = `rgba(0, 255, 0, ${0.3 + intensity * 0.7})`;
      } else if (intensity < 0.75) {
        color = `rgba(255, 255, 0, ${0.4 + intensity * 0.6})`;
      } else {
        color = `rgba(255, 0, 0, ${0.5 + intensity * 0.5})`;
      }

      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw click count labels for top clicks
    const topClicks = [...clickPoints].sort((a, b) => b.count - a.count).slice(0, 10);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    topClicks.forEach(point => {
      ctx.fillText(`${point.count}`, point.x, point.y + 5);
    });

  }, [clickPoints]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Carregando mapa de calor...</div>;
  }

  if (clickPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Nenhum dado de cliques disponível para esta página no período selecionado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total de cliques: {clickPoints.reduce((sum, p) => sum + p.count, 0)}</span>
        <span>Pontos únicos: {clickPoints.length}</span>
      </div>
      
      <div className="border rounded-lg overflow-auto max-h-[600px] bg-white">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(0, 0, 255, 0.6)' }} />
          <span>Baixo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 0, 0.6)' }} />
          <span>Médio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 0, 0.6)' }} />
          <span>Alto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 0, 0, 0.6)' }} />
          <span>Muito Alto</span>
        </div>
      </div>
    </div>
  );
};
