-- Add sequence_type and drip_duration columns to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN sequence_type TEXT,
ADD COLUMN drip_duration TEXT;