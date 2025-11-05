import { z } from 'zod';

// Hero Content Schema
export const heroSchema = z.object({
  headline: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  subtitle: z.string().trim().min(1, "Subtítulo é obrigatório").max(500, "Subtítulo deve ter no máximo 500 caracteres"),
  cta_primary: z.string().trim().min(1, "CTA primário é obrigatório").max(100, "CTA primário deve ter no máximo 100 caracteres"),
  cta_secondary: z.string().trim().min(1, "CTA secundário é obrigatório").max(100, "CTA secundário deve ter no máximo 100 caracteres"),
  stat1_number: z.string().trim().max(50, "Número deve ter no máximo 50 caracteres"),
  stat1_label: z.string().trim().max(100, "Label deve ter no máximo 100 caracteres"),
  stat2_number: z.string().trim().max(50, "Número deve ter no máximo 50 caracteres"),
  stat2_label: z.string().trim().max(100, "Label deve ter no máximo 100 caracteres"),
  stat3_number: z.string().trim().max(50, "Número deve ter no máximo 50 caracteres"),
  stat3_label: z.string().trim().max(100, "Label deve ter no máximo 100 caracteres"),
});

// About Content Schema
export const aboutSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().trim().min(1, "Descrição é obrigatória").max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  name: z.string().trim().max(100, "Nome deve ter no máximo 100 caracteres").optional().or(z.literal('')),
  read_line: z.string().trim().max(200, "Frase deve ter no máximo 200 caracteres").optional().or(z.literal('')),
});

// Book Content Schema
export const bookSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  subtitle: z.string().trim().min(1, "Subtítulo é obrigatório").max(300, "Subtítulo deve ter no máximo 300 caracteres"),
  description: z.string().trim().min(1, "Descrição é obrigatória").max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  purchase_link: z.string().trim().url("Link de compra deve ser uma URL válida").max(500, "URL deve ter no máximo 500 caracteres").optional().or(z.literal('')),
  sample_link: z.string().trim().url("Link de amostra deve ser uma URL válida").max(500, "URL deve ter no máximo 500 caracteres").optional().or(z.literal('')),
});

// Service Schema
export const serviceSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Título deve ter no máximo 100 caracteres"),
  description: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
  icon: z.string().trim().min(1, "Ícone é obrigatório").max(50, "Ícone deve ter no máximo 50 caracteres"),
  display_order: z.number().int("Ordem deve ser um número inteiro").min(0, "Ordem deve ser maior ou igual a 0"),
});

// Blog Post Schema
export const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  excerpt: z.string().trim().min(1, "Resumo é obrigatório").max(500, "Resumo deve ter no máximo 500 caracteres"),
  category: z.string().trim().min(1, "Categoria é obrigatória").max(100, "Categoria deve ter no máximo 100 caracteres"),
  date: z.string().trim().min(1, "Data é obrigatória"),
  linkedin_url: z.string().trim().url("Link do LinkedIn deve ser uma URL válida").max(500, "URL deve ter no máximo 500 caracteres").optional().or(z.literal('')),
});

// Contact Info Schema
export const contactSchema = z.object({
  email: z.string().trim().email("Email deve ser válido").max(255, "Email deve ter no máximo 255 caracteres"),
  whatsapp: z.string().trim().min(1, "WhatsApp é obrigatório").max(50, "WhatsApp deve ter no máximo 50 caracteres"),
  linkedin_url: z.string().trim().url("Link do LinkedIn deve ser uma URL válida").max(500, "URL deve ter no máximo 500 caracteres").optional().or(z.literal('')),
  instagram_url: z.string().trim().url("Link do Instagram deve ser uma URL válida").max(500, "URL deve ter no máximo 500 caracteres").optional().or(z.literal('')),
  youtube_url: z.string().trim().url("Link do YouTube deve ser uma URL válida").max(500, "URL deve ter no máximo 500 caracteres").optional().or(z.literal('')),
});

// Book Feature Schema
export const bookFeatureSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Título deve ter no máximo 100 caracteres"),
  description: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
  icon: z.string().trim().min(1, "Ícone é obrigatório").max(50, "Ícone deve ter no máximo 50 caracteres"),
  display_order: z.number().int("Ordem deve ser um número inteiro").min(0, "Ordem deve ser maior ou igual a 0"),
});

// Book Review Schema
export const bookReviewSchema = z.object({
  reviewer_name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  reviewer_title: z.string().trim().min(1, "Cargo é obrigatório").max(200, "Cargo deve ter no máximo 200 caracteres"),
  review_text: z.string().trim().min(1, "Texto da avaliação é obrigatório").max(1000, "Texto deve ter no máximo 1000 caracteres"),
  rating: z.number().min(1, "Nota deve ser no mínimo 1").max(5, "Nota deve ser no máximo 5"),
  display_order: z.number().int("Ordem deve ser um número inteiro").min(0, "Ordem deve ser maior ou igual a 0"),
});
