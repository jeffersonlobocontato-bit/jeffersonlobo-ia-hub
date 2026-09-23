import { useCallback, useRef, useState } from 'react';
import { PALETAS, ZONA_SEGURA, type VideoProjectConfig, type TemplateTipo } from '@/types/videoEditor';

/** Mídia da moldura: vídeo (tem áudio, é a fonte da transcrição) ou imagem de referência. */
const MolduraMedia = ({ moldura, className }: { moldura: VideoProjectConfig['moldura']; className: string }) => {
  const style = { transform: `scale(${moldura.zoom / 100})`, objectPosition: `${moldura.focalX}% ${moldura.focalY}%` };
  if (!moldura.mediaUrl) return null;
  return moldura.mediaTipo === 'video' ? (
    <video src={moldura.mediaUrl} className={className} style={style} muted playsInline />
  ) : (
    <img src={moldura.mediaUrl} alt="gravação" className={className} style={style} />
  );
};

interface Props {
  template: TemplateTipo;
  config: VideoProjectConfig;
  /** Elemento selecionado pra edição (só a moldura, por enquanto). Clique no palco seleciona. */
  onMolduraChange: (patch: Partial<VideoProjectConfig['moldura']>) => void;
}

/**
 * Pré-visualização do palco 1080×1920 (9:16), escalada pra caber na tela.
 * Tudo é desenhado a partir de `config` — nada aqui é "final": é o mesmo
 * princípio do Carrossel (dado vira card, nunca o contrário).
 *
 * Em templates de moldura flutuante, arraste dentro do palco para
 * reposicionar a moldura. Em templates de tela cheia (a gravação ocupa o
 * palco inteiro) não há o que arrastar — o "fundo" É a gravação.
 */
export const VideoStagePreview = ({ template, config, onMolduraChange }: Props) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const pal = PALETAS[config.paleta];
  const { moldura } = config;
  const telaCheia = moldura.modo === 'tela_cheia';

  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  const atualizarPosicao = useCallback((clientX: number, clientY: number) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = clamp(((clientX - box.left) / box.width) * 100);
    const y = clamp(((clientY - box.top) / box.height) * 100);
    onMolduraChange({ xPct: x, yPct: y });
  }, [onMolduraChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (telaCheia) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setArrastando(true);
    atualizarPosicao(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!arrastando) return;
    atualizarPosicao(e.clientX, e.clientY);
  };
  const handlePointerUp = () => setArrastando(false);

  // Palco é 9:16 (mais alto que largo); moldura é quadrada (aspect-ratio 1/1),
  // então o mesmo comprimento em pixels vale uma % menor da altura do palco
  // do que da largura — sem essa conversão a legenda cai em cima da moldura.
  const alturaMoldura = moldura.larguraPct * (9 / 16);

  const filtroVintageCss = config.filtroVintage.ativo
    ? `sepia(${config.filtroVintage.intensidade * 0.006}) saturate(${1 + config.filtroVintage.intensidade * 0.004}) contrast(1.05) brightness(0.97)`
    : undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative w-full max-w-[280px] overflow-hidden rounded-xl border shadow-sm select-none ${telaCheia ? '' : 'cursor-move'}`}
        style={{ aspectRatio: '9 / 16', background: pal.bgDark, touchAction: 'none' }}
      >
        {/* ── FUNDO ── */}
        {telaCheia ? (
          <div className="absolute inset-0" style={{ filter: filtroVintageCss }}>
            {moldura.mediaUrl ? (
              <MolduraMedia moldura={moldura} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[8px]" style={{ color: `${pal.text}66` }}>
                gravação em tela cheia
              </div>
            )}
            {config.overlayFundo.ativo && config.overlayFundo.imagemUrl && (
              <img
                src={config.overlayFundo.imagemUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
                style={{ opacity: config.overlayFundo.opacidade / 100 }}
              />
            )}
            {config.filtroVintage.ativo && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: `inset 0 0 ${18 + config.filtroVintage.intensidade / 3}px ${6 + config.filtroVintage.intensidade / 6}px rgba(20,10,0,.65)` }}
              />
            )}
          </div>
        ) : template === 'card_dados' ? (
          <>
            {/* barra de gradiente no topo, marca registrada do template */}
            <div
              className="absolute inset-x-0 top-0 h-[1.4%]"
              style={{ background: 'linear-gradient(90deg,#FF7A3D,#FF9F45,#2196A6)' }}
            />
            <div className="absolute inset-x-0 top-[8%] px-[12%] flex flex-col gap-2">
              <div
                className="text-[13px] font-extrabold leading-tight"
                style={{ color: pal.accent, fontFamily: "'DM Sans', sans-serif" }}
              >
                {config.cardDados.titulo}
              </div>
              <div
                className="text-[6px] tracking-wide uppercase"
                style={{ color: pal.text, opacity: 0.85 }}
              >
                {config.cardDados.subtitulo}
              </div>
              {config.cardDados.imagemUrl ? (
                <img src={config.cardDados.imagemUrl} alt="" className="mt-2 w-full rounded-md object-cover" />
              ) : (
                <div
                  className="mt-2 flex h-[22%] items-center justify-center rounded-md border border-dashed text-[7px]"
                  style={{ borderColor: `${pal.accent}55`, color: `${pal.text}77` }}
                >
                  gráfico / dado aqui
                </div>
              )}
              {config.cardDados.fonte && (
                <div className="text-[5px] italic" style={{ color: `${pal.text}66` }}>{config.cardDados.fonte}</div>
              )}
            </div>
          </>
        ) : (
          <>
            {config.fundoDinamico.clipes[0]?.mediaUrl ? (
              <img
                src={config.fundoDinamico.clipes[0].mediaUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[8px]" style={{ color: `${pal.text}66` }}>
                fundo dinâmico ({config.fundoDinamico.clipes.length} clipe{config.fundoDinamico.clipes.length !== 1 ? 's' : ''})
              </div>
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.55) 20%, rgba(0,0,0,.05) 60%)' }} />
          </>
        )}

        {/* ── ZONAS SEGURAS ── */}
        {config.mostrarZonasSeguras && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 border-b border-dashed"
              style={{ height: `${ZONA_SEGURA.topoPct}%`, borderColor: 'rgba(255,255,255,.35)', background: 'rgba(255,0,0,.06)' }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-dashed"
              style={{ height: `${ZONA_SEGURA.baixoPct}%`, borderColor: 'rgba(255,255,255,.35)', background: 'rgba(255,0,0,.06)' }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 border-l border-dashed"
              style={{ width: `${ZONA_SEGURA.direitaPct}%`, borderColor: 'rgba(255,255,255,.35)', background: 'rgba(255,0,0,.06)' }}
            />
          </>
        )}

        {/* ── MOLDURA flutuante (gravação pequena sobre o fundo) ── */}
        {!telaCheia && (
          <div
            className="absolute flex items-center justify-center overflow-hidden shadow-lg"
            style={{
              left: `${moldura.xPct}%`,
              top: `${moldura.yPct}%`,
              width: `${moldura.larguraPct}%`,
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%)',
              borderRadius: '22%',
              border: `2px solid ${pal.accent}88`,
              background: '#222',
            }}
          >
            {moldura.mediaUrl ? (
              <MolduraMedia moldura={moldura} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[6px]" style={{ color: `${pal.text}88` }}>sua gravação</span>
            )}
          </div>
        )}

        {/* ── LEGENDA ── */}
        {config.legenda.ativa && config.legenda.estilo === 'manchete' && (
          <div
            className="absolute inset-x-[8%] flex flex-col items-start gap-[2px] text-left leading-[1.05]"
            style={{ bottom: `${ZONA_SEGURA.baixoPct + 6}%`, fontFamily: "'DM Sans', sans-serif" }}
          >
            {config.legenda.manchete.map((linha, i) => (
              <span
                key={i}
                className={linha.destaque ? 'text-[16px] font-black' : 'text-[8px] font-semibold'}
                style={{ color: pal.text, textShadow: '0 1px 4px rgba(0,0,0,.6)' }}
              >
                {linha.texto}
              </span>
            ))}
          </div>
        )}

        {config.legenda.ativa && config.legenda.estilo === 'frase' && (
          <div
            className="absolute inset-x-[8%] text-left text-[8px] font-semibold"
            style={{ bottom: `${ZONA_SEGURA.baixoPct + 5}%`, color: pal.text, textShadow: '0 1px 4px rgba(0,0,0,.6)', fontFamily: "'DM Sans', sans-serif" }}
          >
            {config.legenda.textoExemplo}
          </div>
        )}

        {config.legenda.ativa && config.legenda.estilo === 'karaoke' && (
          <div
            className="absolute inset-x-[10%] text-center text-[7px] font-bold leading-snug"
            style={{
              top: telaCheia ? undefined : `${moldura.yPct + alturaMoldura / 2 + 3}%`,
              bottom: telaCheia ? `${ZONA_SEGURA.baixoPct + 5}%` : undefined,
              color: pal.text,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {config.legenda.textoExemplo.split(config.legenda.palavraDestaque).map((parte, i, arr) => (
              <span key={i}>
                {parte}
                {i < arr.length - 1 && (
                  <span
                    className="rounded px-1 py-[1px]"
                    style={{ background: pal.accent, color: pal.accentOnDark }}
                  >
                    {config.legenda.palavraDestaque}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {telaCheia ? 'Gravação em tela cheia — sem moldura pra arrastar' : 'Arraste dentro do palco para posicionar a moldura'}
      </p>
    </div>
  );
};
