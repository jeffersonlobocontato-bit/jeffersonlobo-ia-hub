import jsPDF from "jspdf";
import signatureUrl from "@/assets/jefferson-signature.png";

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

export function generateTesteIAPdf(lead: PdfLead, recommendations: PdfRecommendation[]) {
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
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 15; // margem
  const CONTENT_W = W - M * 2;

  // === CAPA ===
  pdf.setFillColor(13, 13, 13);
  pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(252, 211, 77);
  pdf.rect(0, 0, W, 60, "F");
  pdf.setTextColor(13, 13, 13);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.text("TESTE DE", M, 28);
  pdf.text("MATURIDADE EM IA", M, 44);

  pdf.setFontSize(11);
  pdf.setTextColor(252, 211, 77);
  pdf.text("RELATÓRIO PERSONALIZADO", M, 80);

  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text(lead.nome.toUpperCase(), M, 95);

  pdf.setFontSize(11);
  pdf.setTextColor(180, 180, 180);
  pdf.text(
    `${new Date().toLocaleDateString("pt-BR")} · ${lead.finalidade === "PF" ? "Profissional (PF)" : "Liderança / Empresário (PJ)"}`,
    M,
    105
  );

  pdf.setFillColor(252, 211, 77);
  pdf.rect(M, 125, CONTENT_W, 40, "F");
  pdf.setTextColor(13, 13, 13);
  pdf.setFontSize(10);
  pdf.text("SEU NÍVEL DE MATURIDADE", M + 5, 137);
  pdf.setFontSize(28);
  pdf.text((lead.nivel_maturidade || "-").toUpperCase(), M + 5, 158);

  pdf.setFillColor(234, 88, 12);
  pdf.rect(M, 175, CONTENT_W, 40, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text("SCORE GERAL", M + 5, 187);
  pdf.setFontSize(36);
  pdf.text(`${lead.score_geral.toFixed(1)}`, M + 5, 210);
  pdf.setFontSize(14);
  pdf.text("/5.0", M + 40, 210);

  // === PÁGINA 2 — SCORES + COMPETÊNCIAS ===
  pdf.addPage();
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, W, H, "F");

  pdf.setTextColor(13, 13, 13);
  pdf.setFontSize(20);
  pdf.text("SCORES POR NÍVEL", M, 25);

  pdf.setFontSize(12);
  const niveis = [
    { l: "BÁSICO", v: lead.score_basico },
    { l: "INTERMEDIÁRIO", v: lead.score_intermediario },
    { l: "AVANÇADO", v: lead.score_avancado },
  ];
  let y = 40;
  niveis.forEach((n) => {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(M, y, CONTENT_W, 14, "F");
    pdf.setFillColor(252, 211, 77);
    pdf.rect(M, y, (CONTENT_W * (n.v || 0)) / 5, 14, "F");
    pdf.setTextColor(13, 13, 13);
    pdf.setFontSize(11);
    pdf.text(`${n.l}`, M + 5, y + 9);
    pdf.text(`${(n.v || 0).toFixed(1)}/5.0`, W - M - 20, y + 9);
    y += 20;
  });

  y += 10;
  pdf.setFontSize(20);
  pdf.text("COMPETÊNCIAS", M, y);
  y += 12;
  pdf.setFontSize(11);
  Object.entries(competencias).forEach(([k, v]) => {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(M, y, CONTENT_W, 10, "F");
    pdf.setFillColor(252, 211, 77);
    pdf.rect(M, y, (CONTENT_W * v) / 5, 10, "F");
    pdf.setTextColor(13, 13, 13);
    pdf.text(competenciaLabels[k] || k, M + 5, y + 7);
    pdf.text(`${v.toFixed(1)}`, W - M - 10, y + 7);
    y += 14;
  });

  // === PÁGINA 3 — PLANO DE AÇÃO 30/60/90 ===
  const ensureSpace = (need: number) => {
    if (y > H - need - 12) {
      pdf.addPage();
      y = 25;
    }
  };

  if (planoAcao.length > 0) {
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    pdf.setTextColor(13, 13, 13);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("PLANO DE AÇÃO 30 / 60 / 90", M, 25);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(110, 110, 110);
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
      pdf.setFillColor(13, 13, 13);
      pdf.rect(M, y, CONTENT_W, 9, "F");
      pdf.setTextColor(252, 211, 77);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      const headerText = `${i + 1}. ${p.competencia.toUpperCase()} — ${p.rec.titulo}`;
      const headerLines = pdf.splitTextToSize(headerText, CONTENT_W - 6);
      pdf.text(headerLines[0], M + 3, y + 6);
      y += 13;

      // Score
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(9);
      pdf.text(`Score atual: ${p.score.toFixed(1)}/5`, M, y);
      y += 6;

      // Descrição
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const desc = pdf.splitTextToSize(p.rec.descricao || "", CONTENT_W);
      pdf.text(desc, M, y);
      y += desc.length * 4.5 + 3;

      // Por que importa
      if (p.rec.por_que_importa) {
        ensureSpace(20);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(234, 88, 12);
        pdf.text("POR QUE IMPORTA", M, y);
        y += 5;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        const pqi = pdf.splitTextToSize(p.rec.por_que_importa, CONTENT_W);
        pdf.text(pqi, M, y);
        y += pqi.length * 4.5 + 4;
      }

      // Etapas 30/60/90 — layout em linhas separadas com badge à esquerda
      const steps = [
        { l: "30 DIAS", t: acoes.d30, bg: [252, 211, 77], fg: [13, 13, 13] },
        { l: "60 DIAS", t: acoes.d60, bg: [234, 88, 12], fg: [255, 255, 255] },
        { l: "90 DIAS", t: acoes.d90, bg: [13, 13, 13], fg: [252, 211, 77] },
      ];
      const BADGE_W = 22;
      const TEXT_X = M + BADGE_W + 4;
      const TEXT_W = CONTENT_W - BADGE_W - 4;

      steps.forEach((step) => {
        if (!step.t) return;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(30, 30, 30);
        const lines = pdf.splitTextToSize(step.t, TEXT_W);
        const blockH = Math.max(10, lines.length * 4.5 + 3);
        ensureSpace(blockH + 2);

        // Badge
        pdf.setFillColor(step.bg[0], step.bg[1], step.bg[2]);
        pdf.rect(M, y, BADGE_W, blockH, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(step.fg[0], step.fg[1], step.fg[2]);
        pdf.text(step.l, M + BADGE_W / 2, y + blockH / 2 + 2, { align: "center" });

        // Texto
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(30, 30, 30);
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

        // Fundo grafite
        pdf.setFillColor(30, 30, 30);
        pdf.rect(M, y, CONTENT_W, caminhoH, "F");
        // Faixa amarela à esquerda
        pdf.setFillColor(252, 211, 77);
        pdf.rect(M, y, 2, caminhoH, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(252, 211, 77);
        pdf.text("COMO LEVAR ADIANTE", M + 6, y + 5.5);

        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(235, 235, 235);
        pdf.text(caminhoLines, M + 6, y + 10);

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
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");
    pdf.setTextColor(13, 13, 13);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("TRILHA DE CONHECIMENTO", M, 25);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(110, 110, 110);
    const trilhaSub =
      lead.finalidade === "PJ"
        ? "Curadoria para líderes, gestores e empresários — livros, cursos, frameworks e comunidades."
        : "Curadoria para profissionais de mercado — livros, cursos, práticas e comunidades.";
    const subLines = pdf.splitTextToSize(trilhaSub, CONTENT_W);
    pdf.text(subLines, M, 32);

    y = 32 + subLines.length * 5 + 8;

    trilhas.forEach((t) => {
      ensureSpace(20);
      pdf.setFillColor(252, 211, 77);
      pdf.rect(M, y, CONTENT_W, 8, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(13, 13, 13);
      pdf.text(t.comp.toUpperCase(), M + 3, y + 5.5);
      y += 12;

      t.items.forEach((it) => {
        const tipo = (it.tipo || "Recurso").toUpperCase();
        const titulo = it.titulo || "";
        const fonte = it.fonte || "";

        // tipo badge
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        const tipoW = pdf.getTextWidth(tipo) + 6;
        const tipoTextLines = pdf.splitTextToSize(`${titulo}${fonte ? " — " + fonte : ""}`, CONTENT_W - tipoW - 6);
        const blockH = Math.max(8, tipoTextLines.length * 4.3 + 2);
        ensureSpace(blockH + 5);

        pdf.setFillColor(13, 13, 13);
        pdf.rect(M, y, tipoW, 6, "F");
        pdf.setTextColor(252, 211, 77);
        pdf.text(tipo, M + 3, y + 4.2);

        // Texto
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(30, 30, 30);
        pdf.text(tipoTextLines, M + tipoW + 3, y + 4.2);

        y += blockH + 3;

        if (it.link) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(80, 110, 180);
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
  pdf.setFillColor(13, 13, 13);
  pdf.rect(0, 0, W, H, "F");

  // Faixa amarela superior
  pdf.setFillColor(252, 211, 77);
  pdf.rect(0, 0, W, 55, "F");
  pdf.setTextColor(13, 13, 13);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("PRÓXIMO PASSO", M, 22);
  pdf.setFontSize(26);
  pdf.text("LEVE ESSA CONVERSA", M, 36);
  pdf.text("PARA DENTRO DA SUA EMPRESA", M, 48);

  // Pitch
  let cy = 72;
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  const pitchTitle =
    lead.finalidade === "PJ"
      ? "Sua liderança e seus times precisam falar a mesma língua de IA."
      : "Se a empresa onde você atua ainda trata IA como hype, esse relatório é só o começo.";
  const pitchTitleLines = pdf.splitTextToSize(pitchTitle, CONTENT_W);
  pdf.text(pitchTitleLines, M, cy);
  cy += pitchTitleLines.length * 6 + 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(220, 220, 220);
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
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(180, 180, 180);
    pdf.text("Jefferson Lobo · Estrategista de IA", M, cy);
    cy += 6;
  }

  // Caixa de contato
  cy += 6;
  const boxH = 66;
  pdf.setFillColor(252, 211, 77);
  pdf.rect(M, cy, CONTENT_W, boxH, "F");
  pdf.setTextColor(13, 13, 13);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("FALE COMIGO", M + 5, cy + 10);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("JEFFERSON LOBO", M + 5, cy + 20);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Estrategista de IA · Palestrante · Consultor", M + 5, cy + 27);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  let ly = cy + 38;
  pdf.text("Site:", M + 5, ly);
  pdf.setFont("helvetica", "normal");
  pdf.textWithLink("jeffersonlobo.tech", M + 22, ly, { url: "https://jeffersonlobo.tech" });

  ly += 6;
  pdf.setFont("helvetica", "bold");
  pdf.text("E-mail:", M + 5, ly);
  pdf.setFont("helvetica", "normal");
  pdf.textWithLink("contato@jeffersonlobo.tech", M + 22, ly, { url: "mailto:contato@jeffersonlobo.tech" });

  ly += 6;
  pdf.setFont("helvetica", "bold");
  pdf.text("WhatsApp:", M + 5, ly);
  pdf.setFont("helvetica", "normal");
  pdf.textWithLink("(45) 99986-4213", M + 30, ly, { url: "https://wa.me/5545999864213" });

  ly += 6;
  pdf.setFont("helvetica", "bold");
  pdf.text("LinkedIn:", M + 5, ly);
  pdf.setFont("helvetica", "normal");
  pdf.textWithLink("linkedin.com/in/jeffersonlobo", M + 27, ly, { url: "https://www.linkedin.com/in/jeffersonlobo" });

  // Selo laranja
  pdf.setFillColor(234, 88, 12);
  pdf.rect(M, cy + boxH + 6, CONTENT_W, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
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
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 140);
    pdf.text("Jefferson Lobo · Estrategista de IA · jeffersonlobo.tech", W / 2, H - 8, { align: "center" });
  }

  pdf.save(`teste-ia-${lead.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
