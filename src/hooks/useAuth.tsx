import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    console.log('🔵 useAuth: Iniciando useEffect');

    const checkAdminRole = async (userId: string) => {
      console.log('🔍 Checando role admin para:', userId);
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        console.log('📊 Role data:', data);
        
        if (mounted) {
          const isAdminUser = data?.role === 'admin';
          console.log('✅ Setting isAdmin to:', isAdminUser);
          setIsAdmin(isAdminUser);
        }
      } catch (err) {
        console.error('❌ Erro ao checar admin:', err);
        if (mounted) setIsAdmin(false);
      }
    };

    const initializeAuth = async () => {
      console.log('🚀 Inicializando autenticação...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('📱 Session obtida:', session?.user?.email || 'Nenhuma sessão');
        
        if (!mounted) {
          console.log('⚠️ Component desmontado, abortando');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário encontrado, checando role...');
          await checkAdminRole(session.user.id);
        } else {
          console.log('👤 Nenhum usuário, setando isAdmin=false');
          setIsAdmin(false);
        }
        
        console.log('✅ Finalizando loading - setLoading(false)');
        setLoading(false);
      } catch (err) {
        console.error('❌ Erro na inicialização:', err);
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    console.log('👂 Configurando listener onAuthStateChange');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 Auth event:', event, 'Email:', session?.user?.email || 'none');
        
        if (!mounted) {
          console.log('⚠️ Component desmontado no listener');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário no listener, checando role...');
          checkAdminRole(session.user.id);
        } else {
          console.log('👤 Nenhum usuário no listener');
          setIsAdmin(false);
        }
      }
    );

    initializeAuth();

    return () => {
      console.log('🧹 Limpando useAuth');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    });
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir sua senha.",
      });
    }

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};