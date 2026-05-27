import jsPDF from "jspdf";

export interface PdfLead {
  nome: string;
  email?: string;
  finalidade: string;
  score_basico: number | null;
  score_intermediario: number | null;
  score_avancado: number | null;
  score_geral: number | null;
  nivel_maturidade: string | null;
  competencias: Record<string, number> | null;
}

export interface PdfRecommendation {
  competencia: string;
  nivel: string;
  titulo: string;
  descricao: string;
  acao_30d: string | null;
  acao_60d: string | null;
  acao_90d: string | null;
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

  // CAPA
  pdf.setFillColor(13, 13, 13);
  pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(252, 211, 77);
  pdf.rect(0, 0, W, 60, "F");
  pdf.setTextColor(13, 13, 13);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.text("TESTE DE", 15, 28);
  pdf.text("MATURIDADE EM IA", 15, 44);

  pdf.setFontSize(11);
  pdf.setTextColor(252, 211, 77);
  pdf.text("RELATÓRIO PERSONALIZADO", 15, 80);

  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text(lead.nome.toUpperCase(), 15, 95);

  pdf.setFontSize(11);
  pdf.setTextColor(180, 180, 180);
  pdf.text(
    `${new Date().toLocaleDateString("pt-BR")} · ${lead.finalidade === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}`,
    15,
    105
  );

  pdf.setFillColor(252, 211, 77);
  pdf.rect(15, 125, W - 30, 40, "F");
  pdf.setTextColor(13, 13, 13);
  pdf.setFontSize(10);
  pdf.text("SEU NÍVEL DE MATURIDADE", 20, 137);
  pdf.setFontSize(28);
  pdf.text((lead.nivel_maturidade || "-").toUpperCase(), 20, 158);

  pdf.setFillColor(234, 88, 12);
  pdf.rect(15, 175, W - 30, 40, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text("SCORE GERAL", 20, 187);
  pdf.setFontSize(36);
  pdf.text(`${lead.score_geral.toFixed(1)}`, 20, 210);
  pdf.setFontSize(14);
  pdf.text("/5.0", 55, 210);

  // PÁGINA 2
  pdf.addPage();
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, W, H, "F");

  pdf.setTextColor(13, 13, 13);
  pdf.setFontSize(20);
  pdf.text("SCORES POR NÍVEL", 15, 25);

  pdf.setFontSize(12);
  const niveis = [
    { l: "BÁSICO", v: lead.score_basico },
    { l: "INTERMEDIÁRIO", v: lead.score_intermediario },
    { l: "AVANÇADO", v: lead.score_avancado },
  ];
  let y = 40;
  niveis.forEach((n) => {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, y, W - 30, 14, "F");
    pdf.setFillColor(252, 211, 77);
    pdf.rect(15, y, ((W - 30) * (n.v || 0)) / 5, 14, "F");
    pdf.setTextColor(13, 13, 13);
    pdf.setFontSize(11);
    pdf.text(`${n.l}`, 20, y + 9);
    pdf.text(`${(n.v || 0).toFixed(1)}/5.0`, W - 35, y + 9);
    y += 20;
  });

  y += 10;
  pdf.setFontSize(20);
  pdf.text("COMPETÊNCIAS", 15, y);
  y += 12;
  pdf.setFontSize(11);
  Object.entries(competencias).forEach(([k, v]) => {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, y, W - 30, 10, "F");
    pdf.setFillColor(252, 211, 77);
    pdf.rect(15, y, ((W - 30) * v) / 5, 10, "F");
    pdf.setTextColor(13, 13, 13);
    pdf.text(competenciaLabels[k] || k, 20, y + 7);
    pdf.text(`${v.toFixed(1)}`, W - 30, y + 7);
    y += 14;
  });

  // PÁGINA 3
  if (planoAcao.length > 0) {
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    pdf.setTextColor(13, 13, 13);
    pdf.setFontSize(20);
    pdf.text("PLANO DE AÇÃO 30/60/90", 15, 25);

    y = 40;
    planoAcao.forEach((p, i) => {
      if (y > H - 60) {
        pdf.addPage();
        y = 25;
      }
      pdf.setFillColor(13, 13, 13);
      pdf.rect(15, y, W - 30, 8, "F");
      pdf.setTextColor(252, 211, 77);
      pdf.setFontSize(11);
      pdf.text(`${i + 1}. ${p.competencia.toUpperCase()} — ${p.rec.titulo}`, 18, y + 6);
      y += 12;

      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      const desc = pdf.splitTextToSize(p.rec.descricao, W - 30);
      pdf.text(desc, 15, y);
      y += desc.length * 5 + 4;

      [
        { l: "30 DIAS", t: p.rec.acao_30d },
        { l: "60 DIAS", t: p.rec.acao_60d },
        { l: "90 DIAS", t: p.rec.acao_90d },
      ].forEach((step) => {
        if (!step.t) return;
        pdf.setTextColor(234, 88, 12);
        pdf.setFontSize(9);
        pdf.text(`▸ ${step.l}`, 15, y);
        pdf.setTextColor(13, 13, 13);
        const tt = pdf.splitTextToSize(step.t, W - 50);
        pdf.text(tt, 35, y);
        y += tt.length * 5 + 2;
      });
      y += 8;
    });
  }

  const pages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 140);
    pdf.text("Jefferson Lobo · Estrategista de IA · jeffersonlobo.tech", W / 2, H - 8, { align: "center" });
  }

  pdf.save(`teste-ia-${lead.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
