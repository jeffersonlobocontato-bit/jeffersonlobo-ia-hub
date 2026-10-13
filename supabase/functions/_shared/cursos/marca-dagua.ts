// Marca d'água dos PDFs do curso: cada página sai com o e-mail de quem baixou.
// Recebe a biblioteca pdf-lib por parâmetro para funcionar no Deno (edge
// function, npm:pdf-lib) e no Node (testes) sem mudar o código.

// deno-lint-ignore no-explicit-any
type PdfLib = any;

export type Licenca = { email: string; nome?: string | null; curso: string; quando?: Date };

/** Texto do rodapé, só com caracteres que as fontes padrão do PDF aceitam. */
export function textoLicenca(l: Licenca) {
  const data = (l.quando ?? new Date()).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `Licenciado para ${l.email} em ${data} · uso pessoal e intransferível · ${l.curso} · jeffersonlobo.tech`;
}

export async function carimbarPdf(lib: PdfLib, original: Uint8Array, l: Licenca): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = lib;
  const doc = await PDFDocument.load(original, { ignoreEncryption: true, updateMetadata: false });
  const fonte = await doc.embedFont(StandardFonts.Helvetica);
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold);
  const rodape = textoLicenca(l);

  for (const pagina of doc.getPages()) {
    const { width, height } = pagina.getSize();

    // rodapé discreto em todas as páginas
    let tam = 6.5;
    while (tam > 4.5 && fonte.widthOfTextAtSize(rodape, tam) > width - 36) tam -= 0.25;
    const largura = fonte.widthOfTextAtSize(rodape, tam);
    pagina.drawRectangle({ x: (width - largura) / 2 - 6, y: 8, width: largura + 12, height: tam + 6, color: rgb(1, 1, 1), opacity: 0.55 });
    pagina.drawText(rodape, { x: (width - largura) / 2, y: 11, size: tam, font: fonte, color: rgb(0.32, 0.34, 0.36) });

    // e-mail em diagonal, bem claro, no meio da página
    const diag = l.email;
    let td = Math.min(width, height) / 14;
    while (td > 10 && negrito.widthOfTextAtSize(diag, td) > Math.hypot(width, height) * 0.62) td -= 1;
    const wd = negrito.widthOfTextAtSize(diag, td);
    const ang = Math.atan2(height, width);
    pagina.drawText(diag, {
      x: width / 2 - (Math.cos(ang) * wd) / 2 + (Math.sin(ang) * td) / 2,
      y: height / 2 - (Math.sin(ang) * wd) / 2 - (Math.cos(ang) * td) / 2,
      size: td,
      font: negrito,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.07,
      rotate: degrees((ang * 180) / Math.PI),
    });
  }

  doc.setSubject(rodape);
  doc.setKeywords([`licenca:${l.email}`, `curso:${l.curso}`]);
  doc.setProducer('jeffersonlobo.tech');
  return await doc.save({ useObjectStreams: true });
}
