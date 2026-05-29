import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ImageIcon, Video, Loader2, Download, Check } from 'lucide-react';
import { useMediaDownloaded } from '@/hooks/use-media-downloaded';

export type MediaTipo = 'imagem' | 'video' | 'nenhum';

type Props = {
  mediaUrl: string | null;
  mediaTipo: MediaTipo;
  onChange: (url: string | null, tipo: MediaTipo) => void;
  disabled?: boolean;
  /** Quando passado, marca em localStorage que a mídia já foi baixada para essa campanha. */
  campaignId?: string | null;
};

const MAX_IMG = 5 * 1024 * 1024;
const MAX_VID = 16 * 1024 * 1024;

export const CampaignMediaUploader = ({ mediaUrl, mediaTipo, onChange, disabled, campaignId }: Props) => {
  const { toast } = useToast();
  const { downloaded, markDownloaded } = useMediaDownloaded(campaignId ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/');
    if (!isImg && !isVid) {
      toast({ title: 'Tipo inválido', description: 'Apenas imagem ou vídeo.', variant: 'destructive' });
      return;
    }
    if (isImg && file.size > MAX_IMG) {
      toast({ title: 'Imagem muito grande', description: 'Máx 5MB.', variant: 'destructive' });
      return;
    }
    if (isVid && file.size > MAX_VID) {
      toast({ title: 'Vídeo muito grande', description: 'Máx 16MB. WhatsApp não aceita maior.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? (isImg ? 'jpg' : 'mp4');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('press-media').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('press-media').getPublicUrl(path);
    onChange(data.publicUrl, isImg ? 'imagem' : 'video');
    setUploading(false);
  };

  const remove = () => onChange(null, 'nenhum');

  const downloadMedia = async () => {
    if (!mediaUrl) return;
    try {
      const res = await fetch(mediaUrl);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = mediaUrl.split('/').pop() ?? 'midia';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      markDownloaded();
    } catch {
      window.open(mediaUrl, '_blank');
      markDownloaded();
    }
  };

  if (mediaUrl) {
    return (
      <div className="border-2 border-dashed p-3 space-y-2 bg-muted/30">
        <div className="flex items-center gap-3">
          {mediaTipo === 'imagem' ? (
            <img src={mediaUrl} alt="preview" className="w-24 h-24 object-cover border" />
          ) : (
            <video src={mediaUrl} className="w-24 h-24 object-cover border" muted />
          )}
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold uppercase flex items-center gap-1">
              {mediaTipo === 'imagem' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              {mediaTipo === 'imagem' ? 'Imagem' : 'Vídeo'} carregado
            </div>
            <div className="text-muted-foreground truncate">{mediaUrl.split('/').pop()}</div>
          </div>
          <div className="flex flex-col gap-1">
            <Button size="sm" variant={downloaded ? 'outline' : 'default'} onClick={downloadMedia} type="button">
              {downloaded
                ? <><Check className="w-3 h-3 mr-1" /> Baixada</>
                : <><Download className="w-3 h-3 mr-1" /> Baixar</>}
            </Button>
            {!disabled && (
              <Button size="sm" variant="ghost" onClick={remove} type="button">
                <X className="w-3 h-3 mr-1" /> Remover
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed p-4 text-center bg-muted/20">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4"
        className="hidden"
        disabled={disabled || uploading}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {uploading ? 'Enviando...' : 'Enviar foto ou vídeo'}
      </Button>
      <p className="text-[11px] text-muted-foreground mt-2">
        JPG/PNG/WEBP ≤ 5MB · MP4 ≤ 16MB (limite do WhatsApp)
      </p>
    </div>
  );
};
