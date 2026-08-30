import { Check } from 'lucide-react';
import type { MaterialBlock } from '@/data/materiais';
import { slugifyHeading } from '@/lib/materiais-utils';

interface MaterialBlocksProps {
  blocks: MaterialBlock[];
}

export const MaterialBlocks = ({ blocks }: MaterialBlocksProps) => (
  <div className="space-y-5">
    {blocks.map((block, index) => {
      if (block.type === 'h2') {
        return (
          <h2
            key={index}
            id={slugifyHeading(block.text)}
            className="display-title scroll-mt-28 border-l-4 border-primary pl-4 pt-6 text-xl sm:text-2xl md:text-3xl"
          >
            {block.text}
          </h2>
        );
      }

      if (block.type === 'label') {
        return (
          <p
            key={index}
            className="pt-2 text-xs font-semibold uppercase tracking-wider text-primary"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {block.text}
          </p>
        );
      }

      if (block.type === 'list') {
        return (
          <ul key={index} className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-base sm:text-lg text-muted-foreground">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/50 bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }

      if (block.type === 'row') {
        return (
          <div
            key={index}
            className="flex flex-wrap gap-2 rounded-md border border-border bg-muted/40 p-3"
          >
            {block.cells.map((cell, i) => (
              <span
                key={i}
                className="rounded-sm bg-background px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {cell}
              </span>
            ))}
          </div>
        );
      }

      return (
        <p key={index} className="text-base sm:text-lg leading-relaxed text-muted-foreground">
          {block.text}
        </p>
      );
    })}
  </div>
);
