import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const UpdateNotifier = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Verifica a cada 30 segundos se há uma nova versão
    const checkForUpdates = () => {
      const currentVersion = localStorage.getItem('app_version');
      const newVersion = Date.now().toString();
      
      if (!currentVersion) {
        localStorage.setItem('app_version', newVersion);
      } else if (currentVersion !== newVersion) {
        // Versão diferente detectada
        setShowUpdate(true);
      }
    };

    const interval = setInterval(checkForUpdates, 30000);
    checkForUpdates();

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    localStorage.setItem('app_version', Date.now().toString());
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg shadow-2xl max-w-sm">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Nova versão disponível!</p>
            <p className="text-sm opacity-90 mb-3">
              Atualize para ver as últimas mudanças.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRefresh}
                className="bg-white text-primary hover:bg-white/90"
              >
                Atualizar agora
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUpdate(false)}
                className="text-white hover:bg-white/20"
              >
                Depois
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotifier;
