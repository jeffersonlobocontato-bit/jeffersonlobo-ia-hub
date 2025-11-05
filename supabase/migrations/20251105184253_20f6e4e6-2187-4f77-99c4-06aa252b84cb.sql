-- Create book_reviews table for managing book testimonials
CREATE TABLE IF NOT EXISTS public.book_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rating numeric NOT NULL DEFAULT 5.0,
  review_text text NOT NULL,
  reviewer_name text NOT NULL,
  reviewer_title text NOT NULL,
  active boolean DEFAULT true,
  display_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active book reviews"
  ON public.book_reviews
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage book reviews"
  ON public.book_reviews
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_book_reviews_updated_at
  BEFORE UPDATE ON public.book_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();