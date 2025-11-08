import { supabase } from '@/integrations/supabase/client';

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useTrackCTA = () => {
  const trackCTA = async (ctaName: string, ctaLocation: string) => {
    try {
      const sessionId = getSessionId();
      await supabase.from('cta_events').insert({
        session_id: sessionId,
        cta_name: ctaName,
        cta_location: ctaLocation,
        page_path: window.location.pathname,
      });
    } catch (error) {
      console.error('Error tracking CTA:', error);
    }
  };

  return { trackCTA };
};
