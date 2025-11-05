-- Criar função e trigger para tornar o primeiro usuário em admin automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Conta quantos usuários já existem
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Se for o primeiro usuário, torna admin automaticamente
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa após inserção de novo usuário
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();