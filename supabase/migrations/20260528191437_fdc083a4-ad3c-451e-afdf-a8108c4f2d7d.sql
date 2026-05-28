ALTER TABLE public.press_contacts
  ADD CONSTRAINT press_contacts_email_unique_constraint UNIQUE (email);

ALTER TABLE public.press_contacts
  ADD CONSTRAINT press_contacts_whatsapp_unique_constraint UNIQUE (whatsapp);