-- Create press_lists table
CREATE TABLE public.press_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_lists TO authenticated;
GRANT ALL ON public.press_lists TO service_role;

ALTER TABLE public.press_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage press lists"
ON public.press_lists
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create press_list_members (N:N)
CREATE TABLE public.press_list_members (
  list_id uuid NOT NULL REFERENCES public.press_lists(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.press_contacts(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, contact_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_list_members TO authenticated;
GRANT ALL ON public.press_list_members TO service_role;

ALTER TABLE public.press_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage press list members"
ON public.press_list_members
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_press_list_members_contact ON public.press_list_members(contact_id);