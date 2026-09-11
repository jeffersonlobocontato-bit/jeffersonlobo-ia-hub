-- A barra "Já estive no palco e nas mesas de" ainda tinha dados de
-- placeholder do setup inicial (Gazeta do Povo, MIT, Imersão Internacional,
-- Sebrae, Fiep). Substitui pela lista real de organizações confirmada pelo
-- Jefferson: CNI, Gazeta do Povo, MIT, Unisenai, Sistema Fiep, Sesi, IEL,
-- Sistema Gurgacz de Comunicação, Laguna Construtora e Adepol-PR.
DELETE FROM public.speaking_logos;

INSERT INTO public.speaking_logos (name, display_order) VALUES
  ('CNI', 1),
  ('Gazeta do Povo', 2),
  ('MIT', 3),
  ('Unisenai', 4),
  ('Sistema Fiep', 5),
  ('Sesi', 6),
  ('IEL', 7),
  ('Sistema Gurgacz de Comunicação', 8),
  ('Laguna Construtora', 9),
  ('Adepol-PR', 10);
