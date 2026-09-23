import { PALETAS, type VideoProjectConfig } from '@/types/videoEditor';

interface Props {
  config: VideoProjectConfig;
}

/**
 * Capa do vídeo (1080×1350, proporção do card de feed), no mesmo padrão
 * visual do Carrossel Jefferson: fundo escuro, badge em âmbar, título em
 * DM Sans 900, @handle em Fira Code. Usa um quadro do próprio vídeo (ou
 * uma foto de referência) como imagem de fundo.
 */
export const CoverPreview = ({ config }: Props) => {
  const pal = PALETAS[config.paleta];
  const { capa } = config;

  return (
    <div
      className="relative w-full max-w-[220px] overflow-hidden rounded-xl border shadow-sm"
      style={{ aspectRatio: '4 / 5', background: pal.bgDark }}
    >
      {capa.imagemUrl && (
        <img src={capa.imagemUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${pal.bgDark} 40%, ${pal.bgDark}55 100%)` }}
      />
      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-4">
        <span
          className="inline-block w-fit rounded px-2 py-1 text-[9px] font-medium"
          style={{ background: pal.accent, color: pal.accentOnDark, fontFamily: "'Fira Code', monospace" }}
        >
          {capa.badge}
        </span>
        <h3
          className="text-[16px] font-black leading-[1.05] tracking-tight"
          style={{ color: pal.text, fontFamily: "'DM Sans', sans-serif" }}
        >
          {capa.titulo}
        </h3>
        <span className="text-[9px]" style={{ color: pal.accent, fontFamily: "'Fira Code', monospace" }}>
          {capa.handle}
        </span>
      </div>
    </div>
  );
};
