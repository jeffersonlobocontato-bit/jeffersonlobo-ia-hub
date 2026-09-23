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

export type ElementoSelecionado = 'fundo' | 'moldura';

interface Props {
  template: TemplateTipo;
  config: VideoProjectConfig;
  onMolduraChange: (patch: Partial<VideoProjectConfig['moldura']>) => void;
  /**
   * Sempre o primeiro clipe de fundo dinâmico (clipes[0]) — hoje o palco só
   * mostra esse, sem trocar pelos outros conforme o playhead da timeline
   * anda (isso ainda não existe; a pré-visualização é estática). Enquanto
   * for assim, editar aqui só faz sentido editar o clipe que está exibido.
   */
  onClipeFundoChange: (patch: Partial<VideoProjectConfig['fundoDinamico']['clipes'][number]>) => void;
  elementoSelecionado: ElementoSelecionado;
  onSelecionarElemento: (el: ElementoSelecionado) => void;
}

/**
 * Pré-visualização do palco 1080×1920 (9:16), escalada pra caber na tela.
 * Tudo é desenhado a partir de `config` — nada aqui é "final": é o mesmo
 * princípio do Carrossel (dado vira card, nunca o contrário).
 *
 * Etapa 1 da estrutura tipo Filmora: fundo e moldura são camadas
 * selecionáveis separadamente — clicar no fundo não arrasta mais a moldura
 * por baixo dele. Cada uma tem sua própria área de clique/arraste; a
 * moldura fica por cima (z-index maior) e para a propagação do clique, o
 * fundo ocupa o resto do palco.
 */
export const VideoStagePreview = ({
  template, config, onMolduraChange, onClipeFundoChange, elementoSelecionado, onSelecionarElemento,
}: Props) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const pal = PALETAS[config.paleta];
  const { moldura } = config;
  const telaCheia = moldura.modo === 'tela_cheia';
  const clipeFundo = template === 'fundo_dinamico' ? config.fundoDinamico.clipes[0] : undefined;

  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  const atualizarPosicaoMoldura = useCallback((clientX: number, clientY: number) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = clamp(((clientX - box.left) / box.width) * 100);
    const y = clamp(((clientY - box.top) / box.height) * 100);
    onMolduraChange({ xPct: x, yPct: y });
  }, [onMolduraChange]);

  // A moldura tem sua própria área de arrastar — não é mais o palco inteiro
  // que dispara o drag dela, senão clicar no fundo (atrás dela) nunca
  // conseguia selecionar o fundo, só a moldura.
  const handleMolduraPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelecionarElemento('moldura');
    if (telaCheia) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setArrastando(true);
    atualizarPosicaoMoldura(e.clientX, e.clientY);
  };
  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!arrastando) return;
    atualizarPosicaoMoldura(e.clientX, e.clientY);
  };
  const handleStagePointerUp = () => setArrastando(false);

  // Clicar em qualquer parte do palco que não seja a moldura seleciona o
  // fundo — em tela cheia a moldura É o fundo, então não há distinção.
  const handleFundoPointerDown = () => {
    if (!telaCheia) onSelecionarElemento('fundo');
  };

  // Palco é 9:16 (mais alto que largo); moldura é quadrada (aspect-ratio 1/1),
  // então o mesmo comprimento em pixels vale uma % menor da altura do palco
  // do que da largura — sem essa conversão a legenda cai em cima da moldura.
  const alturaMoldura = moldura.larguraPct * (9 / 16);

  const filtroVintageCss = config.filtroVintage.ativo
    ? `sepia(${config.filtroVintage.intensidade * 0.006}) saturate(${1 + config.filtroVintage.intensidade * 0.004}) contrast(1.05) brightness(0.97)`
    : undefined;

  // "inset" é obrigatório aqui — tanto o palco quanto a moldura têm
  // overflow-hidden (pra recortar o vídeo dentro deles), e uma sombra sem
  // inset desenha pra fora do elemento, então ficava cortada e nunca
  // aparecia. Pra dentro, o anel sempre é visível.
  const anelSelecao = (ativo: boolean) => (ativo ? `inset 0 0 0 2px ${pal.accent}` : undefined);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={stageRef}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerLeave={handleStagePointerUp}
        className="relative w-full max-w-[280px] overflow-hidden rounded-xl border shadow-sm select-none"
        style={{ aspectRatio: '9 / 16', background: pal.bgDark, touchAction: 'none' }}
      >
        {/* ── FUNDO (camada selecionável, atrás da moldura) ── */}
        <div
          onPointerDown={handleFundoPointerDown}
          className={`absolute inset-0 ${telaCheia ? '' : 'cursor-pointer'}`}
          style={{ boxShadow: !telaCheia ? anelSelecao(elementoSelecionado === 'fundo') : undefined }}
        >
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
              {clipeFundo?.mediaUrl ? (
                <img
                  src={clipeFundo.mediaUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    transform: `scale(${clipeFundo.zoom / 100})`,
                    objectPosition: `${clipeFundo.focalX}% ${clipeFundo.focalY}%`,
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[8px]" style={{ color: `${pal.text}66` }}>
                  fundo dinâmico ({config.fundoDinamico.clipes.length} clipe{config.fundoDinamico.clipes.length !== 1 ? 's' : ''})
                </div>
              )}
              <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.55) 20%, rgba(0,0,0,.05) 60%)' }} />
            </>
          )}
        </div>

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
            onPointerDown={handleMolduraPointerDown}
            className="absolute flex cursor-move items-center justify-center overflow-hidden shadow-lg"
            style={{
              left: `${moldura.xPct}%`,
              top: `${moldura.yPct}%`,
              width: `${moldura.larguraPct}%`,
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%)',
              borderRadius: '22%',
              border: `2px solid ${pal.accent}88`,
              background: '#222',
              boxShadow: anelSelecao(elementoSelecionado === 'moldura'),
              touchAction: 'none',
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
            className="pointer-events-none absolute inset-x-[8%] flex flex-col items-start gap-[2px] text-left leading-[1.05]"
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
            className="pointer-events-none absolute inset-x-[8%] text-left text-[8px] font-semibold"
            style={{ bottom: `${ZONA_SEGURA.baixoPct + 5}%`, color: pal.text, textShadow: '0 1px 4px rgba(0,0,0,.6)', fontFamily: "'DM Sans', sans-serif" }}
          >
            {config.legenda.textoExemplo}
          </div>
        )}

        {config.legenda.ativa && config.legenda.estilo === 'karaoke' && (
          <div
            className="pointer-events-none absolute inset-x-[10%] text-center text-[7px] font-bold leading-snug"
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

      {/* ── PAINEL DO ELEMENTO SELECIONADO ── */}
      {!telaCheia && (
        <div className="w-full max-w-[280px] rounded-md border p-2 text-xs">
          {elementoSelecionado === 'moldura' ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Moldura selecionada.</span> Arraste pra reposicionar. Tamanho, zoom e foco ficam na aba Moldura.
            </p>
          ) : template === 'fundo_dinamico' && clipeFundo?.mediaUrl ? (
            <div className="space-y-2">
              <p className="font-medium">Fundo selecionado — clipe 1</p>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground">Zoom</span>
                  <input
                    type="range" min={100} max={200} value={clipeFundo.zoom}
                    onChange={(e) => onClipeFundoChange({ zoom: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground">Foco H</span>
                  <input
                    type="range" min={0} max={100} value={clipeFundo.focalX}
                    onChange={(e) => onClipeFundoChange({ focalX: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground">Foco V</span>
                  <input
                    type="range" min={0} max={100} value={clipeFundo.focalY}
                    onChange={(e) => onClipeFundoChange({ focalY: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Fundo selecionado.</span>
              {template === 'fundo_dinamico' ? ' Envie um clipe na aba Fundo pra poder ajustar zoom e foco.' : ' Esse template não tem posição/zoom ajustável no fundo.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
