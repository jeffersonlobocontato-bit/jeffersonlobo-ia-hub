import { ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsTrackerProps {
  children: ReactNode;
}

export const AnalyticsTracker = ({ children }: AnalyticsTrackerProps) => {
  useAnalytics();
  return <>{children}</>;
};
