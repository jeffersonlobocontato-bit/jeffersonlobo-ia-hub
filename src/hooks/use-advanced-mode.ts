import { useEffect, useState } from 'react';

const KEY = 'press-advanced-mode';

export const useAdvancedMode = () => {
  const [advanced, setAdvanced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEY) === '1';
  });

  useEffect(() => {
    if (advanced) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  }, [advanced]);

  return { advanced, setAdvanced, toggle: () => setAdvanced(v => !v) };
};
