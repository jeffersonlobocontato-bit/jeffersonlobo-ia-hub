import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import manropeRegularAsset from "@/assets/fonts/Manrope-Regular.ttf.asset.json";
import manropeExtraBoldAsset from "@/assets/fonts/Manrope-ExtraBold.ttf.asset.json";
import ibmPlexMonoSemiBoldAsset from "@/assets/fonts/IBMPlexMono-SemiBold.ttf.asset.json";

// Mesma identidade visual de src/lib/teste-ia-pdf.ts (Manual da Marca Jefferson Lobo v1 · 2026)
const PETROLEO = "#12201E";
const AMBAR = "#E29F65";
const PAPEL = "#F2EEE4";
const MUTED_ON_DARK = "#8A9D97";

export type CreativeFormat = "card" | "carousel" | "story";

export interface CreativeSlideData {
  headline: string;
  body: string;
  image_url: string | null;
}

// Resolução de exportação (px) por formato — proporções recomendadas do Instagram.
const CANVAS_SIZE: Record<CreativeFormat, { w: number; h: number }> = {
  card: { w: 1080, h: 1350 }, // 4:5
  carousel: { w: 1080, h: 1350 }, // 4:5, mesma grade do card
  story: { w: 1080, h: 1920 }, // 9:16
};

let fontsReadyPromise: Promise<void> | null = null;

async function ensureBrandFonts(): Promise<void> {
  if (!fontsReadyPromise) {
    fontsReadyPromise = (async () => {
      const faces = [
        { family: "Manrope", url: manropeRegularAsset.url, weight: "400" },
        { family: "ManropeExtraBold", url: manropeExtraBoldAsset.url, weight: "800" },
        { family: "IBMPlexMono", url: ibmPlexMonoSemiBoldAsset.url, weight: "600" },
      ];
      await Promise.all(
        faces.map(async (f) => {
          const face = new FontFace(f.family, `url(${f.url})`, { weight: f.weight });
          const loaded = await face.load();
          document.fonts.add(loaded);
        }),
      );
    })();
  }
  await fontsReadyPromise;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Quebra `text` em linhas que cabem em `maxWidth`, respeitando a fonte já setada no ctx. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface CreativeCanvasHandle {
  exportPng: () => Promise<Blob>;
}

interface CreativeCanvasProps {
  format: CreativeFormat;
  slide: CreativeSlideData;
  slideLabel?: string; // ex.: "2/6" no carrossel
  className?: string;
}

export const CreativeCanvas = forwardRef<CreativeCanvasHandle, CreativeCanvasProps>(
  ({ format, slide, slideLabel, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      exportPng: async () => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("canvas não montado");
        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("falha ao exportar PNG"))), "image/png");
        });
      },
    }));

    useEffect(() => {
      let cancelled = false;

      (async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { w, h } = CANVAS_SIZE[format];
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await ensureBrandFonts();
        if (cancelled) return;

        // Fundo
        ctx.fillStyle = PETROLEO;
        ctx.fillRect(0, 0, w, h);

        if (slide.image_url) {
          try {
            const img = await loadImage(slide.image_url);
            if (cancelled) return;
            // cover: preenche o canvas mantendo proporção, cortando o excesso
            const scale = Math.max(w / img.width, h / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
          } catch {
            // sem imagem — segue só com o fundo de marca
          }
        }

        // Gradiente escuro no terço inferior, para o texto ficar legível sobre a foto
        const gradient = ctx.createLinearGradient(0, h * 0.4, 0, h);
        gradient.addColorStop(0, "rgba(18,32,30,0)");
        gradient.addColorStop(1, "rgba(18,32,30,0.92)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, h * 0.4, w, h * 0.6);

        const margin = w * 0.08;
        const maxTextWidth = w - margin * 2;

        // Kicker de marca no topo
        ctx.fillStyle = AMBAR;
        ctx.font = `600 ${w * 0.026}px IBMPlexMono`;
        ctx.textBaseline = "top";
        ctx.fillText("JEFFERSON LOBO · IA", margin, margin * 0.6);
        if (slideLabel) {
          const label = slideLabel;
          const labelWidth = ctx.measureText(label).width;
          ctx.fillStyle = MUTED_ON_DARK;
          ctx.fillText(label, w - margin - labelWidth, margin * 0.6);
        }

        // Headline
        ctx.fillStyle = PAPEL;
        ctx.font = `800 ${w * 0.062}px ManropeExtraBold`;
        ctx.textBaseline = "alphabetic";
        const headlineLines = wrapText(ctx, slide.headline || "", maxTextWidth);
        const headlineLineHeight = w * 0.072;
        const bodyLines = slide.body ? wrapText(ctx, slide.body, maxTextWidth) : [];
        const bodyLineHeight = w * 0.038;

        const blockHeight = headlineLines.length * headlineLineHeight + (bodyLines.length ? bodyLines.length * bodyLineHeight + w * 0.03 : 0);
        let y = h - margin - blockHeight + headlineLineHeight * 0.8;

        for (const line of headlineLines) {
          ctx.fillText(line, margin, y);
          y += headlineLineHeight;
        }

        if (bodyLines.length) {
          y += w * 0.02;
          ctx.font = `400 ${w * 0.032}px Manrope`;
          ctx.fillStyle = MUTED_ON_DARK;
          for (const line of bodyLines) {
            ctx.fillText(line, margin, y);
            y += bodyLineHeight;
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [format, slide.headline, slide.body, slide.image_url, slideLabel]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, background: PETROLEO }}
      />
    );
  },
);

CreativeCanvas.displayName = "CreativeCanvas";
