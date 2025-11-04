-- Create campaign_shares table for sharing campaigns
CREATE TABLE IF NOT EXISTS public.campaign_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  allow_export BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.campaign_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone with share token can view
CREATE POLICY "Anyone can view shared campaigns with token"
  ON public.campaign_shares
  FOR SELECT
  USING (true);

-- Policy: Campaign owners can create shares
CREATE POLICY "Campaign owners can create shares"
  ON public.campaign_shares
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Policy: Campaign owners can delete shares
CREATE POLICY "Campaign owners can delete shares"
  ON public.campaign_shares
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_shares_token ON public.campaign_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_campaign_shares_campaign_id ON public.campaign_shares(campaign_id);