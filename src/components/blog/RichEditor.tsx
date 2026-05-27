import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Sparkles, Minus, Undo2, Redo2, Pilcrow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (markdown: string) => void;
  onUploadImage?: () => Promise<string | null>;
}

const ToolBtn = ({
  onClick, active, title, children, disabled,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode; disabled?: boolean }) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn('h-8 w-8 p-0', active && 'bg-primary/20 text-primary')}
  >
    {children}
  </Button>
);

export const RichEditor = ({ value, onChange, onUploadImage }: Props) => {
  const lastEmittedRef = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
      Markdown.configure({ html: false, breaks: true, transformPastedText: true, transformCopiedText: true }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      // @ts-ignore
      const md = editor.storage.markdown.getMarkdown() as string;
      lastEmittedRef.current = md;
      onChange(md);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
  });

  // Sync external value changes (e.g., loaded from DB) without breaking selection on every keystroke
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    // @ts-ignore
    editor.commands.setContent(value || '', { emitUpdate: false });
    lastEmittedRef.current = value;
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = async () => {
    let url: string | null = null;
    if (onUploadImage) url = await onUploadImage();
    else url = window.prompt('URL da imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const insertPullQuote = () => {
    const text = window.prompt('Frase de destaque:', 'Escreva aqui a frase em destaque');
    if (!text) return;
    // Insert a paragraph then a blockquote with [!destaque] marker. tiptap-markdown will serialize as > ...
    editor
      .chain()
      .focus()
      .insertContent([
        { type: 'paragraph' },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: `[!destaque] ${text}` }] },
          ],
        },
        { type: 'paragraph' },
      ])
      .run();
  };

  return (
    <div className="border-2 border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-border bg-muted/40 sticky top-0 z-10">
        <ToolBtn title="Parágrafo" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Título 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Título 4" active={editor.isActive('heading', { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <ToolBtn title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Código" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <ToolBtn title="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <ToolBtn title="Link" active={editor.isActive('link')} onClick={setLink}><LinkIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Imagem" onClick={insertImage}><ImageIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Frase de destaque" onClick={insertPullQuote}><Sparkles className="w-4 h-4 text-primary" /></ToolBtn>
        <ToolBtn title="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <ToolBtn title="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="w-4 h-4" /></ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
