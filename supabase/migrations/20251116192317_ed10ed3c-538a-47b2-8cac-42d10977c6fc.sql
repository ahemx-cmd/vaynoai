-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_platform TEXT CHECK (user_platform IN ('seller', 'founder')),
ADD COLUMN IF NOT EXISTS brand_guidelines JSONB,
ADD COLUMN IF NOT EXISTS ui_theme TEXT DEFAULT 'system' CHECK (ui_theme IN ('light', 'dark', 'system')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;