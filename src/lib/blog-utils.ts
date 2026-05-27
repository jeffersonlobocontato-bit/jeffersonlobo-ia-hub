export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function extractFirstParagraph(md: string | null | undefined, max = 280): string {
  if (!md) return '';
  const cleaned = md
    .replace(/^#+\s.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>~]/g, '')
    .trim();
  const first = cleaned.split(/\n\s*\n/).find((p) => p.trim().length > 0) || '';
  return first.length > max ? first.slice(0, max).trimEnd() + '…' : first;
}

export function calcReadingMinutes(md: string | null | undefined): number {
  if (!md) return 0;
  const words = md.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function isInternalPost(post: { content_md?: string | null }): boolean {
  return !!(post.content_md && post.content_md.trim().length > 0);
}

// Split markdown into top-level blocks (paragraphs, headings, lists, code blocks)
export function splitMarkdownBlocks(md: string): string[] {
  if (!md) return [];
  // Preserve fenced code blocks
  const blocks: string[] = [];
  const lines = md.split('\n');
  let buf: string[] = [];
  let inCode = false;
  const flush = () => {
    const joined = buf.join('\n').trim();
    if (joined) blocks.push(joined);
    buf = [];
  };
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        buf.push(line);
        flush();
        inCode = false;
      } else {
        flush();
        buf.push(line);
        inCode = true;
      }
      continue;
    }
    if (!inCode && line.trim() === '') {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

// Pick insertion indexes at ~25%, 55%, 85% of total blocks (min spacing of 3)
export function pickCtaPositions(totalBlocks: number, ctaCount: number): number[] {
  if (totalBlocks < 4 || ctaCount <= 0) return [];
  const ratios = [0.25, 0.55, 0.85];
  const positions = new Set<number>();
  for (let i = 0; i < Math.min(ctaCount, ratios.length); i++) {
    const idx = Math.round(totalBlocks * ratios[i]);
    positions.add(Math.min(totalBlocks - 1, Math.max(1, idx)));
  }
  return Array.from(positions).sort((a, b) => a - b);
}
