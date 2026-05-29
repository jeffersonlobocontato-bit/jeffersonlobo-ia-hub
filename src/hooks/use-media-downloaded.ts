import { useCallback, useEffect, useState } from 'react';

/** Marca em localStorage se o usuário já baixou a mídia daquela campanha
 *  (uso operacional: ele baixa no celular antes do disparo). */
const key = (campaignId: string) => `press-media-downloaded:${campaignId}`;

export function useMediaDownloaded(campaignId: string | null | undefined) {
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!campaignId) { setDownloaded(false); return; }
    setDownloaded(localStorage.getItem(key(campaignId)) === '1');
  }, [campaignId]);

  const markDownloaded = useCallback(() => {
    if (!campaignId) return;
    localStorage.setItem(key(campaignId), '1');
    setDownloaded(true);
  }, [campaignId]);

  const reset = useCallback(() => {
    if (!campaignId) return;
    localStorage.removeItem(key(campaignId));
    setDownloaded(false);
  }, [campaignId]);

  return { downloaded, markDownloaded, reset };
}
