-- Drop existing policies that don't account for shared campaigns
DROP POLICY IF EXISTS "Users can view their own or guest campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view emails from their or guest campaigns" ON email_sequences;

-- Create new policy for campaigns that allows viewing if:
-- 1. User owns the campaign, OR
-- 2. Campaign is a guest campaign (no user_id), OR
-- 3. Campaign has been shared (exists in campaign_shares)
CREATE POLICY "Users can view their own, guest, or shared campaigns"
ON campaigns FOR SELECT
USING (
  auth.uid() = user_id 
  OR user_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM campaign_shares 
    WHERE campaign_shares.campaign_id = campaigns.id
  )
);

-- Create new policy for email_sequences that allows viewing if:
-- 1. User owns the campaign, OR
-- 2. Campaign is a guest campaign (no user_id), OR
-- 3. Campaign has been shared (exists in campaign_shares)
CREATE POLICY "Users can view emails from their own, guest, or shared campaigns"
ON email_sequences FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = email_sequences.campaign_id
    AND (
      campaigns.user_id = auth.uid()
      OR campaigns.user_id IS NULL
      OR EXISTS (
        SELECT 1 FROM campaign_shares
        WHERE campaign_shares.campaign_id = campaigns.id
      )
    )
  )
);