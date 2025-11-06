import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ AdminRoute - loading:', loading, 'user:', user?.email, 'isAdmin:', isAdmin);

  if (loading) {
    console.log('⏳ AdminRoute: Mostrando tela de loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 AdminRoute: Sem usuário, redirecionando para /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log('🚫 AdminRoute: Usuário não é admin');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-destructive mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página. Apenas administradores podem acessar o painel.
          </p>
          <a href="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </a>
        </div>
      </div>
    );
  }

  console.log('✅ AdminRoute: Permitindo acesso');
  return <>{children}</>;
};

export default AdminRoute;