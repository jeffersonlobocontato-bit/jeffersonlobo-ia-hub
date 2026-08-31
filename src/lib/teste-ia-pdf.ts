import jsPDF from "jspdf";
import signatureUrl from "@/assets/jefferson-signature.png";
import instrumentSerifRegularAsset from "@/assets/fonts/InstrumentSerif-Regular.ttf.asset.json";
import instrumentSerifItalicAsset from "@/assets/fonts/InstrumentSerif-Italic.ttf.asset.json";
import manropeRegularAsset from "@/assets/fonts/Manrope-Regular.ttf.asset.json";
import manropeBoldAsset from "@/assets/fonts/Manrope-Bold.ttf.asset.json";
import manropeExtraBoldAsset from "@/assets/fonts/Manrope-ExtraBold.ttf.asset.json";
import ibmPlexMonoSemiBoldAsset from "@/assets/fonts/IBMPlexMono-SemiBold.ttf.asset.json";

// === IDENTIDADE VISUAL — Manual da Marca Jefferson Lobo (v1 · 2026) ===
const PETROLEO: [number, number, number] = [18, 32, 30]; // #12201E — fundo
const PETROLEO_2: [number, number, number] = [27, 40, 36]; // #1B2824 — cards sobre fundo escuro
const AMBAR: [number, number, number] = [226, 159, 101]; // #E29F65 — assinatura e destaque
const AMBAR_ESCURO: [number, number, number] = [199, 117, 35]; // #C77523 — destaque sobre fundo claro
const PAPEL: [number, number, number] = [242, 238, 228]; // #F2EEE4 — texto sobre fundo escuro / trilhos
const PAPEL_2: [number, number, number] = [251, 249, 243]; // #FBF9F3 — fundo claro
const TINTA: [number, number, number] = [26, 36, 34]; // #1A2422 — texto sobre fundo claro
const TINTA_SUAVE: [number, number, number] = [61, 71, 68]; // #3D4744 — texto secundário sobre fundo claro
const MUTED_ON_DARK: [number, number, number] = [138, 157, 151]; // texto secundário sobre fundo escuro

// === Carregamento e cache das fontes da marca (Instrument Serif · Manrope · IBM Plex Mono) ===
interface FontFile {
  url: string;
  file: string;
  family: string;
  style: "normal" | "bold" | "italic";
}

const FONT_FILES: FontFile[] = [
  { url: instrumentSerifRegularAsset.url, file: "InstrumentSerif-Regular.ttf", family: "InstrumentSerif", style: "normal" },
  { url: instrumentSerifItalicAsset.url, file: "InstrumentSerif-Italic.ttf", family: "InstrumentSerif", style: "italic" },
  { url: manropeRegularAsset.url, file: "Manrope-Regular.ttf", family: "Manrope", style: "normal" },
  { url: manropeBoldAsset.url, file: "Manrope-Bold.ttf", family: "Manrope", style: "bold" },
  { url: manropeExtraBoldAsset.url, file: "Manrope-ExtraBold.ttf", family: "ManropeExtraBold", style: "normal" },
  { url: ibmPlexMonoSemiBoldAsset.url, file: "IBMPlexMono-SemiBold.ttf", family: "IBMPlexMono", style: "bold" },
];

let fontsRegisteredPromise: Promise<void> | null = null;

async function ensureBrandFonts(pdf: jsPDF): Promise<void> {
  if (!fontsRegisteredPromise) {
    fontsRegisteredPromise = (async () => {
      for (const f of FONT_FILES) {
        const res = await fetch(f.url);
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        pdf.addFileToVFS(f.file, base64);
        pdf.addFont(f.file, f.family, f.style);
      }
    })();
  }
  await fontsRegisteredPromise;
}

// Pré-carrega a assinatura como dataURL para uso síncrono no jsPDF
let signatureDataUrl: string | null = null;
(async () => {
  try {
    const res = await fetch(signatureUrl);
    const blob = await res.blob();
    signatureDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Falha ao carregar assinatura:", e);
  }
})();



export type Finalidade = "PF" | "PJ" | string;

export interface PdfLead {
  nome: string;
  email?: string;
  finalidade: Finalidade;
  score_basico: number | null;
  score_intermediario: number | null;
  score_avancado: number | null;
  score_geral: number | null;
  nivel_maturidade: string | null;
  competencias: Record<string, number> | null;
}

export interface AprendizadoItem {
  tipo?: string;
  titulo?: string;
  fonte?: string;
  link?: string;
}

export interface PdfRecommendation {
  competencia: string;
  nivel: string;
  titulo: string;
  descricao: string;
  por_que_importa?: string | null;
  acao_30d: string | null;
  acao_60d: string | null;
  acao_90d: string | null;
  acao_pf_30d?: string | null;
  acao_pf_60d?: string | null;
  acao_pf_90d?: string | null;
  acao_pj_30d?: string | null;
  acao_pj_60d?: string | null;
  acao_pj_90d?: string | null;
  aprendizado_pf?: AprendizadoItem[] | null;
  aprendizado_pj?: AprendizadoItem[] | null;
}

const competenciaLabels: Record<string, string> = {
  estrategia: "Estratégia",
  processos: "Processos",
  dados: "Dados",
  ferramentas: "Ferramentas",
  pessoas: "Pessoas/Skills",
  etica: "Ética/Compliance",
  seguranca: "Segurança",
  governanca: "Governança",
};

// Caminhos de influência por competência — orientação sutil, NÃO pitch de venda.
// O leitor é o agente: "proponha", "sugira", "leve a pauta para…".
const caminhoPorCompetencia: Record<string, { pf: string; pj: string }> = {
  estrategia: {
    pf: "Proponha à sua liderança uma palestra executiva de IA para alinhar a visão antes de qualquer roadmap.",
    pj: "Uma keynote estratégica com referência externa acelera o alinhamento do C-level antes do roadmap.",
  },
  processos: {
    pf: "Sugira ao seu time uma imersão prática para mapear e redesenhar processos com IA.",
    pj: "Workshop hands-on de redesenho de processos com IA destrava ganhos rápidos e mensuráveis.",
  },
  dados: {
    pf: "Indique uma consultoria de diagnóstico de dados antes da empresa escalar iniciativas de IA.",
    pj: "Consultoria estratégica de dados evita stacks caras sem fundação — diagnóstico primeiro, ferramenta depois.",
  },
  ferramentas: {
    pf: "Leve para sua área um workshop de ferramentas de IA generativa aplicado ao dia a dia.",
    pj: "Workshop de adoção guiada reduz custo de teste-e-erro e padroniza o uso entre times.",
  },
  pessoas: {
    pf: "Proponha uma palestra de sensibilização seguida de trilha de capacitação para o time.",
    pj: "Programa de champions + palestras internas forma multiplicadores e acelera adoção cultural.",
  },
  etica: {
    pf: "Indique uma palestra sobre IA responsável para jurídico, RH e liderança.",
    pj: "Imersão de ética e compliance em IA protege a marca antes do primeiro incidente público.",
  },
  seguranca: {
    pf: "Sugira um diagnóstico de segurança em uso de IA antes da adoção em massa.",
    pj: "Consultoria de segurança define guardrails antes do shadow AI virar exposição de dados.",
  },
  governanca: {
    pf: "Proponha à diretoria uma consultoria para estruturar a governança de IA da empresa.",
    pj: "Consultoria de governança formaliza papéis, comitês e políticas — base para escalar com segurança.",
  },
};

function pickCaminho(competenciaKey: string, finalidade: Finalidade): string {
  const c = caminhoPorCompetencia[competenciaKey];
  if (!c) {
    return finalidade === "PJ"
      ? "Vale considerar um programa sob medida (palestra, workshop ou consultoria) para acelerar esse avanço com sua equipe."
      : "Vale propor à sua liderança um programa sob medida — palestra, workshop ou consultoria — para acelerar esse avanço.";
  }
  return finalidade === "PJ" ? c.pj : c.pf;
}

function pickAcoes(rec: PdfRecommendation, finalidade: Finalidade) {
  const isPJ = finalidade === "PJ";
  return {
    d30: (isPJ ? rec.acao_pj_30d : rec.acao_pf_30d) || rec.acao_30d || "",
    d60: (isPJ ? rec.acao_pj_60d : rec.acao_pf_60d) || rec.acao_60d || "",
    d90: (isPJ ? rec.acao_pj_90d : rec.acao_pf_90d) || rec.acao_90d || "",
  };
}

function pickAprendizado(rec: PdfRecommendation, finalidade: Finalidade): AprendizadoItem[] {
  const list = finalidade === "PJ" ? rec.aprendizado_pj : rec.aprendizado_pf;
  return Array.isArray(list) ? list : [];
}

export async function generateTesteIAPdf(lead: PdfLead, recommendations: PdfRecommendation[]) {
  if (lead.score_geral == null) throw new Error("Relatório indisponível: lead sem score.");

  const competencias = lead.competencias || {};
  const gaps = Object.entries(competencias)
    .filter(([, v]) => v < 3.0)
    .sort((a, b) => a[1] - b[1])
    .map(([k, v]) => ({ key: k, competencia: competenciaLabels[k] || k, score: v }));

  const planoAcao = gaps.slice(0, 3).map((gap) => {
    const rec = recommendations.find((r) => r.competencia === gap.key) || recommendations[0];
    return { ...gap, rec };
  });

  const pdf = new jsPDF("p", "mm", "a4");
  await ensureBrandFonts(pdf);
  const pageIsDark: boolean[] = [];

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 15; // margem
  const CONTENT_W = W - M * 2;

  const setFill = (c: [number, number, number]) => pdf.setFillColor(c[0], c[1], c[2]);
  const setText = (c: [number, number, number]) => pdf.setTextColor(c[0], c[1], c[2]);
  const kicker = (text: string, x: number, y: number, size = 9, color: [number, number, number] = AMBAR) => {
    pdf.setFont("IBMPlexMono", "bold");
    pdf.setFontSize(size);
    setText(color);
    pdf.text(text.toUpperCase(), x, y);
  };
  const title = (text: string, x: number, y: number, size = 28, color: [number, number, number] = PAPEL) => {
    pdf.setFont("InstrumentSerif", "normal");
    pdf.setFontSize(size);
    setText(color);
    pdf.text(text, x, y);
  };

  // === CAPA ===
  setFill(PETROLEO);
  pdf.rect(0, 0, W, H, "F");
  pageIsDark[1] = true;

  kicker("Relatório personalizado", M, 22, 9, AMBAR);

  title("Teste de", M, 42, 30, PAPEL);
  title("Maturidade em IA", M, 58, 30, PAPEL);

  pdf.setDrawColor(AMBAR[0], AMBAR[1], AMBAR[2]);
  pdf.setLineWidth(0.8);
  pdf.line(M, 66, M + 28, 66);

  pdf.setFont("Manrope", "bold");
  pdf.setFontSize(20);
  setText(PAPEL);
  pdf.text(lead.nome, M, 82);

  pdf.setFont("Manrope", "normal");
  pdf.setFontSize(10.5);
  setText(MUTED_ON_DARK);
  pdf.text(
    `${new Date().toLocaleDateString("pt-BR")} · ${lead.finalidade === "PF" ? "Profissional (PF)" : "Liderança / Empresário (PJ)"}`,
    M,
    90
  );

  // Card — nível de maturidade
  setFill(PETROLEO_2);
  pdf.roundedRect(M, 110, CONTENT_W, 42, 2, 2, "F");
  kicker("Seu nível de maturidade", M + 6, 122, 8.5, AMBAR);
  pdf.setFont("InstrumentSerif", "normal");
  pdf.setFontSize(26);
  setText(PAPEL);
  pdf.text(lead.nivel_maturidade || "-", M + 6, 143);

  // Card — score geral
  setFill(PETROLEO_2);
  pdf.roundedRect(M, 160, CONTENT_W, 46, 2, 2, "F");
  kicker("Score geral", M + 6, 172, 8.5, AMBAR);
  pdf.setFont("ManropeExtraBold", "normal");
  pdf.setFontSize(34);
  setText(AMBAR);
  pdf.text(`${lead.score_geral.toFixed(1)}`, M + 6, 195);
  pdf.setFont("Manrope", "normal");
  pdf.setFontSize(13);
  setText(MUTED_ON_DARK);
  pdf.text("/5.0", M + 6 + pdf.getTextWidth(`${lead.score_geral.toFixed(1)} `) + 20, 195);

  // === PÁGINA 2 — SCORES + COMPETÊNCIAS ===
  pdf.addPage();
  setFill(PAPEL_2);
  pdf.rect(0, 0, W, H, "F");
  pageIsDark[pdf.getNumberOfPages()] = false;

  title("Scores por nível", M, 25, 19, TINTA);

  const niveis = [
    { l: "BÁSICO", v: lead.score_basico },
    { l: "INTERMEDIÁRIO", v: lead.score_intermediario },
    { l: "AVANÇADO", v: lead.score_avancado },
  ];
  let y = 38;
  niveis.forEach((n) => {
    setFill(PAPEL);
    pdf.rect(M, y, CONTENT_W, 14, "F");
    setFill(AMBAR);
    pdf.rect(M, y, (CONTENT_W * (n.v || 0)) / 5, 14, "F");
    pdf.setFont("IBMPlexMono", "bold");
    pdf.setFontSize(10);
    setText(TINTA);
    pdf.text(n.l, M + 5, y + 9);
    pdf.setFont("Manrope", "bold");
    pdf.text(`${(n.v || 0).toFixed(1)}/5.0`, W - M - 22, y + 9);
    y += 20;
  });

  y += 8;
  title("Competências", M, y, 19, TINTA);
  y += 12;
  Object.entries(competencias).forEach(([k, v]) => {
    setFill(PAPEL);
    pdf.rect(M, y, CONTENT_W, 10, "F");
    setFill(AMBAR);
    pdf.rect(M, y, (CONTENT_W * v) / 5, 10, "F");
    pdf.setFont("Manrope", "normal");
    pdf.setFontSize(10.5);
    setText(TINTA);
    pdf.text(competenciaLabels[k] || k, M + 5, y + 7);
    pdf.setFont("Manrope", "bold");
    pdf.text(`${v.toFixed(1)}`, W - M - 10, y + 7);
    y += 14;
  });

  // === PÁGINA 3 — PLANO DE AÇÃO 30/60/90 ===
  const ensureSpace = (need: number) => {
    if (y > H - need - 12) {
      pdf.addPage();
      setFill(PAPEL_2);
      pdf.rect(0, 0, W, H, "F");
      pageIsDark[pdf.getNumberOfPages()] = false;
      y = 25;
    }
  };

  if (planoAcao.length > 0) {
    pdf.addPage();
    setFill(PAPEL_2);
    pdf.rect(0, 0, W, H, "F");
    pageIsDark[pdf.getNumberOfPages()] = false;

    title("Plano de ação 30 / 60 / 90", M, 25, 19, TINTA);

    pdf.setFont("Manrope", "normal");
    pdf.setFontSize(10);
    setText(TINTA_SUAVE);
    const personaLine =
      lead.finalidade === "PJ"
        ? "Recomendações para liderança, gestores e empresários (PJ)"
        : "Recomendações para profissionais de mercado (PF)";
    pdf.text(personaLine, M, 32);

    y = 44;

    planoAcao.forEach((p, i) => {
      const acoes = pickAcoes(p.rec, lead.finalidade);

      ensureSpace(60);

      // Cabeçalho do bloco
      setFill(PETROLEO);
      pdf.rect(M, y, CONTENT_W, 9, "F");
      pdf.setFont("IBMPlexMono", "bold");
      pdf.setFontSize(10.5);
      setText(AMBAR);
      const headerText = `${i + 1}. ${p.competencia.toUpperCase()} — ${p.rec.titulo}`;
      const headerLines = pdf.splitTextToSize(headerText, CONTENT_W - 6);
      pdf.text(headerLines[0], M + 3, y + 6);
      y += 13;

      // Score
      pdf.setFont("Manrope", "normal");
      setText(TINTA_SUAVE);
      pdf.setFontSize(9);
      pdf.text(`Score atual: ${p.score.toFixed(1)}/5`, M, y);
      y += 6;

      // Descrição
      pdf.setFontSize(10);
      setText(TINTA);
      const desc = pdf.splitTextToSize(p.rec.descricao || "", CONTENT_W);
      pdf.text(desc, M, y);
      y += desc.length * 4.5 + 3;

      // Por que importa
      if (p.rec.por_que_importa) {
        ensureSpace(20);
        pdf.setFont("IBMPlexMono", "bold");
        pdf.setFontSize(8.5);
        setText(AMBAR_ESCURO);
        pdf.text("POR QUE IMPORTA", M, y);
        y += 5;
        pdf.setFont("InstrumentSerif", "italic");
        pdf.setFontSize(10.5);
        setText(TINTA_SUAVE);
        const pqi = pdf.splitTextToSize(p.rec.por_que_importa, CONTENT_W);
        pdf.text(pqi, M, y);
        y += pqi.length * 4.7 + 4;
      }

      // Etapas 30/60/90 — layout em linhas separadas com badge à esquerda
      // Gradiente âmbar (imediato) → âmbar-escuro → petróleo (fundação de longo prazo)
      const steps = [
        { l: "30 DIAS", t: acoes.d30, bg: AMBAR, fg: PETROLEO },
        { l: "60 DIAS", t: acoes.d60, bg: AMBAR_ESCURO, fg: PAPEL_2 },
        { l: "90 DIAS", t: acoes.d90, bg: PETROLEO, fg: AMBAR },
      ];
      const BADGE_W = 22;
      const TEXT_X = M + BADGE_W + 4;
      const TEXT_W = CONTENT_W - BADGE_W - 4;

      steps.forEach((step) => {
        if (!step.t) return;
        pdf.setFont("Manrope", "normal");
        pdf.setFontSize(9.5);
        const lines = pdf.splitTextToSize(step.t, TEXT_W);
        const blockH = Math.max(10, lines.length * 4.5 + 3);
        ensureSpace(blockH + 2);

        // Badge
        setFill(step.bg);
        pdf.rect(M, y, BADGE_W, blockH, "F");
        pdf.setFont("IBMPlexMono", "bold");
        pdf.setFontSize(7.5);
        setText(step.fg);
        pdf.text(step.l, M + BADGE_W / 2, y + blockH / 2 + 2, { align: "center" });

        // Texto
        pdf.setFont("Manrope", "normal");
        pdf.setFontSize(9.5);
        setText(TINTA);
        pdf.text(lines, TEXT_X, y + 5);

        y += blockH + 3;
      });

      // Caminho de influência — orientação sutil conectando o gap a uma ação
      // que o leitor pode propor dentro da empresa. Tom: carreira, não venda.
      const caminhoTxt = pickCaminho(p.key, lead.finalidade);
      if (caminhoTxt) {
        const caminhoLines = pdf.splitTextToSize(caminhoTxt, CONTENT_W - 8);
        const caminhoH = Math.max(14, caminhoLines.length * 4.5 + 9);
        ensureSpace(caminhoH + 4);

        // Fundo petróleo
        setFill(PETROLEO);
        pdf.rect(M, y, CONTENT_W, caminhoH, "F");
        // Faixa âmbar à esquerda
        setFill(AMBAR);
        pdf.rect(M, y, 2, caminhoH, "F");

        pdf.setFont("IBMPlexMono", "bold");
        pdf.setFontSize(7.5);
        setText(AMBAR);
        pdf.text("COMO LEVAR ADIANTE", M + 6, y + 5.5);

        pdf.setFont("InstrumentSerif", "italic");
        pdf.setFontSize(11);
        setText(PAPEL);
        pdf.text(caminhoLines, M + 6, y + 11);

        y += caminhoH + 4;
      }

      y += 6;
    });
  }

  // === PÁGINA(S) FINAL — TRILHA DE CONHECIMENTO ===
  const trilhas = planoAcao
    .map((p) => ({ comp: p.competencia, items: pickAprendizado(p.rec, lead.finalidade) }))
    .filter((t) => t.items.length > 0);

  if (trilhas.length > 0) {
    pdf.addPage();
    setFill(PAPEL_2);
    pdf.rect(0, 0, W, H, "F");
    pageIsDark[pdf.getNumberOfPages()] = false;
    title("Trilha de conhecimento", M, 25, 19, TINTA);

    pdf.setFont("Manrope", "normal");
    pdf.setFontSize(10);
    setText(TINTA_SUAVE);
    const trilhaSub =
      lead.finalidade === "PJ"
        ? "Curadoria para líderes, gestores e empresários — livros, cursos, frameworks e comunidades."
        : "Curadoria para profissionais de mercado — livros, cursos, práticas e comunidades.";
    const subLines = pdf.splitTextToSize(trilhaSub, CONTENT_W);
    pdf.text(subLines, M, 32);

    y = 32 + subLines.length * 5 + 8;

    trilhas.forEach((t) => {
      ensureSpace(20);
      setFill(AMBAR);
      pdf.rect(M, y, CONTENT_W, 8, "F");
      pdf.setFont("IBMPlexMono", "bold");
      pdf.setFontSize(10);
      setText(PETROLEO);
      pdf.text(t.comp.toUpperCase(), M + 3, y + 5.5);
      y += 12;

      t.items.forEach((it) => {
        const tipo = (it.tipo || "Recurso").toUpperCase();
        const titulo = it.titulo || "";
        const fonte = it.fonte || "";

        // tipo badge
        pdf.setFont("IBMPlexMono", "bold");
        pdf.setFontSize(7.5);
        const tipoW = pdf.getTextWidth(tipo) + 6;
        const tipoTextLines = pdf.splitTextToSize(`${titulo}${fonte ? " — " + fonte : ""}`, CONTENT_W - tipoW - 6);
        const blockH = Math.max(8, tipoTextLines.length * 4.3 + 2);
        ensureSpace(blockH + 5);

        setFill(PETROLEO);
        pdf.rect(M, y, tipoW, 6, "F");
        setText(AMBAR);
        pdf.text(tipo, M + 3, y + 4.2);

        // Texto
        pdf.setFont("Manrope", "normal");
        pdf.setFontSize(9.5);
        setText(TINTA);
        pdf.text(tipoTextLines, M + tipoW + 3, y + 4.2);

        y += blockH + 3;

        if (it.link) {
          pdf.setFont("Manrope", "normal");
          pdf.setFontSize(8);
          setText(AMBAR_ESCURO);
          const linkLines = pdf.splitTextToSize(it.link, CONTENT_W - 6);
          pdf.textWithLink(linkLines[0], M + tipoW + 3, y, { url: it.link });
          y += 5;
        }
      });
      y += 6;
    });
  }

  // === PÁGINA FINAL — CTA SPEAKER / CONSULTOR ===
  pdf.addPage();
  setFill(PETROLEO);
  pdf.rect(0, 0, W, H, "F");
  pageIsDark[pdf.getNumberOfPages()] = true;

  // Faixa âmbar superior
  setFill(AMBAR);
  pdf.rect(0, 0, W, 55, "F");
  kicker("Próximo passo", M, 22, 9.5, PETROLEO);
  pdf.setFont("InstrumentSerif", "normal");
  pdf.setFontSize(26);
  setText(PETROLEO);
  pdf.text("Leve essa conversa", M, 38);
  pdf.text("para dentro da sua empresa", M, 50);

  // Pitch
  let cy = 72;
  pdf.setFont("Manrope", "bold");
  pdf.setFontSize(13);
  setText(PAPEL);
  const pitchTitle =
    lead.finalidade === "PJ"
      ? "Sua liderança e seus times precisam falar a mesma língua de IA."
      : "Se a empresa onde você atua ainda trata IA como hype, esse relatório é só o começo.";
  const pitchTitleLines = pdf.splitTextToSize(pitchTitle, CONTENT_W);
  pdf.text(pitchTitleLines, M, cy);
  cy += pitchTitleLines.length * 6 + 6;

  pdf.setFont("Manrope", "normal");
  pdf.setFontSize(10.5);
  setText(MUTED_ON_DARK);
  const pitch = [
    "Sou Jefferson Lobo — estrategista de IA, palestrante e consultor para empresas que querem sair do improviso e construir uma operação madura, ética e produtiva com Inteligência Artificial.",
    "",
    "Trabalho com:",
    "• Palestras e keynotes para eventos corporativos, convenções e summits.",
    "• Imersões e workshops de sensibilização e mudança de mindset para lideranças e equipes.",
    "• Consultoria estratégica para estruturar governança, processos e capacitação em IA.",
    "",
    lead.finalidade === "PJ"
      ? "Se esse diagnóstico apontou lacunas em estratégia, pessoas, governança ou segurança — é exatamente aí que eu atuo. Posso desenhar um programa sob medida para sua empresa."
      : "Se você identifica que a empresa onde você trabalha precisa desse despertar — me indique. Posso conversar com a liderança e desenhar uma ação sob medida (palestra, imersão ou consultoria).",
  ];
  pitch.forEach((p) => {
    if (p === "") {
      cy += 3;
      return;
    }
    const lines = pdf.splitTextToSize(p, CONTENT_W);
    pdf.text(lines, M, cy);
    cy += lines.length * 5 + 2;
  });

  // Assinatura manuscrita (sobre o fundo escuro, antes da caixa de contato)
  if (signatureDataUrl) {
    cy += 4;
    const sigW = 55;
    const sigH = sigW * (216 / 673); // mantém proporção original
    try {
      pdf.addImage(signatureDataUrl, "PNG", M, cy, sigW, sigH);
    } catch (e) {
      console.warn("Falha ao inserir assinatura no PDF:", e);
    }
    cy += sigH + 1;
    pdf.setFont("Manrope", "normal");
    pdf.setFontSize(9);
    setText(MUTED_ON_DARK);
    pdf.text("Jefferson Lobo · Estrategista de IA", M, cy);
    cy += 6;
  }

  // Caixa de contato
  cy += 6;
  const boxH = 66;
  setFill(AMBAR);
  pdf.roundedRect(M, cy, CONTENT_W, boxH, 2, 2, "F");
  kicker("Fale comigo", M + 5, cy + 10, 8.5, PETROLEO);

  pdf.setFont("Manrope", "bold");
  pdf.setFontSize(14);
  setText(PETROLEO);
  pdf.text("JEFFERSON LOBO", M + 5, cy + 21);
  pdf.setFont("Manrope", "normal");
  pdf.setFontSize(9.5);
  pdf.text("Estrategista de IA · Palestrante · Consultor", M + 5, cy + 27);

  pdf.setFont("Manrope", "bold");
  pdf.setFontSize(10);
  let ly = cy + 38;
  pdf.text("Site:", M + 5, ly);
  pdf.setFont("Manrope", "normal");
  pdf.textWithLink("jeffersonlobo.tech", M + 22, ly, { url: "https://jeffersonlobo.tech" });

  ly += 6;
  pdf.setFont("Manrope", "bold");
  pdf.text("E-mail:", M + 5, ly);
  pdf.setFont("Manrope", "normal");
  pdf.textWithLink("lobo@aivozes.com.br", M + 22, ly, { url: "mailto:lobo@aivozes.com.br" });

  ly += 6;
  pdf.setFont("Manrope", "bold");
  pdf.text("WhatsApp:", M + 5, ly);
  pdf.setFont("Manrope", "normal");
  pdf.textWithLink("(45) 99986-4213", M + 30, ly, { url: "https://wa.me/5545999864213" });

  ly += 6;
  pdf.setFont("Manrope", "bold");
  pdf.text("LinkedIn:", M + 5, ly);
  pdf.setFont("Manrope", "normal");
  pdf.textWithLink("linkedin.com/in/jeffersonlobo", M + 27, ly, { url: "https://www.linkedin.com/in/jeffersonlobo" });

  // Selo petróleo
  setFill(PETROLEO_2);
  pdf.rect(M, cy + boxH + 6, CONTENT_W, 18, "F");
  pdf.setFont("IBMPlexMono", "bold");
  pdf.setFontSize(10);
  setText(AMBAR);
  pdf.text(
    "INDIQUE PARA SUA EMPRESA · AGENDE UMA CONVERSA SEM COMPROMISSO",
    W / 2,
    cy + boxH + 18,
    { align: "center" }
  );


  // === RODAPÉ ===
  const pages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFont("IBMPlexMono", "bold");
    pdf.setFontSize(7.5);
    setText(pageIsDark[i] ? MUTED_ON_DARK : TINTA_SUAVE);
    pdf.text("Jefferson Lobo · Estrategista de IA · jeffersonlobo.tech", W / 2, H - 8, { align: "center" });
  }

  pdf.save(`teste-ia-${lead.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
