import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Variable, Undo2, Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const VARIABLES = [
  { key: 'primeiro_nome', label: 'Primeiro nome' },
  { key: 'contato', label: 'Contato (nome completo)' },
  { key: 'veiculo', label: 'Veículo' },
  { key: 'municipio', label: 'Município' },
  { key: 'regiao', label: 'Região' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'meio', label: 'Meio' },
];

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
    className={cn('h-9 w-9 p-0', active && 'bg-primary/20 text-primary')}
  >
    {children}
  </Button>
);

export const PressRichEditor = ({ value, onChange }: Props) => {
  const { toast } = useToast();
  const lastEmittedRef = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, horizontalRule: false, codeBlock: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[280px] p-4 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    editor.commands.setContent(value || '', { emitUpdate: false } as any);
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

  const uploadImage = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const path = `press-emails/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`;
        const { error } = await supabase.storage.from('blog-covers').upload(path, file, { upsert: false });
        if (error) {
          toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
          return resolve(null);
        }
        const { data } = supabase.storage.from('blog-covers').getPublicUrl(path);
        resolve(data.publicUrl);
      };
      input.click();
    });
  };

  const insertImage = async () => {
    const url = await uploadImage();
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const insertVariable = (key: string) => {
    editor.chain().focus().insertContent(`{{${key}}}`).run();
  };

  return (
    <div className="border-2 border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-border bg-muted/40 sticky top-0 z-10">
        <ToolBtn title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <ToolBtn title="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <ToolBtn title="Link" active={editor.isActive('link')} onClick={setLink}><LinkIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Imagem (upload)" onClick={insertImage}><ImageIcon className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-9 px-2 gap-1" title="Inserir variável">
              <Variable className="w-4 h-4" /> <span className="text-xs">Variável</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {VARIABLES.map(v => (
              <DropdownMenuItem key={v.key} onClick={() => insertVariable(v.key)}>
                <code className="text-xs mr-2">{`{{${v.key}}}`}</code> {v.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="w-px h-6 bg-border mx-1 ml-auto" />
        <ToolBtn title="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn title="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="w-4 h-4" /></ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
