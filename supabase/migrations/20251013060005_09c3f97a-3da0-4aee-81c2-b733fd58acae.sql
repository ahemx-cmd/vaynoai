-- Add new columns to campaigns table for word count and CTA options
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS words_per_email INTEGER DEFAULT 250 CHECK (words_per_email >= 50 AND words_per_email <= 500),
ADD COLUMN IF NOT EXISTS include_cta BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cta_link TEXT;

COMMENT ON COLUMN public.campaigns.words_per_email IS 'Number of words per email (50-500)';
COMMENT ON COLUMN public.campaigns.include_cta IS 'Whether to include Call-to-Action in emails';
COMMENT ON COLUMN public.campaigns.cta_link IS 'Optional CTA link for emails';