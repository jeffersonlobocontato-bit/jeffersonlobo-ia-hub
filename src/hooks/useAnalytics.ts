import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getTrafficAttribution } from '@/lib/traffic-source';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Batch events to reduce database calls
let clickEventsBatch: any[] = [];
let scrollEventsBatch: any[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

const flushBatch = async () => {
  if (clickEventsBatch.length > 0) {
    await supabase.from('click_events').insert(clickEventsBatch);
    clickEventsBatch = [];
  }
  if (scrollEventsBatch.length > 0) {
    await supabase.from('scroll_events').insert(scrollEventsBatch);
    scrollEventsBatch = [];
  }
  batchTimeout = null;
};

const scheduleBatchFlush = () => {
  if (!batchTimeout) {
    batchTimeout = setTimeout(flushBatch, 2000);
  }
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionId = getSessionId();
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const lastScrollUpdate = useRef<number>(0);

  // Track page view
  const trackPageView = useCallback(async () => {
    const analytics = {
      session_id: sessionId,
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      duration_seconds: 0,
    };

    await supabase.from('site_analytics').insert(analytics);
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
  }, [location.pathname, sessionId]);

  // Update page duration on leave
  const updatePageDuration = useCallback(async () => {
    const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);
    if (duration > 0) {
      await supabase
        .from('site_analytics')
        .update({ duration_seconds: duration })
        .eq('session_id', sessionId)
        .eq('page_path', location.pathname)
        .order('created_at', { ascending: false })
        .limit(1);
    }
  }, [location.pathname, sessionId]);

  // Track click events
  const trackClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    clickEventsBatch.push({
      session_id: sessionId,
      page_path: location.pathname,
      element_id: target.id || null,
      element_class: target.className || null,
      element_text: target.textContent?.substring(0, 100) || null,
      x_position: Math.round(event.clientX),
      y_position: Math.round(event.clientY + window.scrollY),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    });

    scheduleBatchFlush();
  }, [location.pathname, sessionId]);

  // Track scroll depth
  const trackScroll = useCallback(() => {
    const now = Date.now();
    // Throttle: only update every 500ms
    if (now - lastScrollUpdate.current < 500) return;
    lastScrollUpdate.current = now;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    if (scrollPercent > maxScrollDepth.current) {
      maxScrollDepth.current = scrollPercent;
      
      scrollEventsBatch.push({
        session_id: sessionId,
        page_path: location.pathname,
        scroll_depth_percent: scrollPercent,
        max_scroll_depth: Math.round(scrollTop),
      });

      scheduleBatchFlush();
    }
  }, [location.pathname, sessionId]);

  // Track page view on route change
  useEffect(() => {
    trackPageView();

    return () => {
      updatePageDuration();
    };
  }, [trackPageView, updatePageDuration]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('click', trackClick);
    window.addEventListener('scroll', trackScroll, { passive: true });

    return () => {
      document.removeEventListener('click', trackClick);
      window.removeEventListener('scroll', trackScroll);
    };
  }, [trackClick, trackScroll]);

  // Flush batch on unmount
  useEffect(() => {
    return () => {
      if (batchTimeout) clearTimeout(batchTimeout);
      flushBatch();
    };
  }, []);

  return { sessionId };
};
