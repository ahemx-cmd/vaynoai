-- Allow guest campaigns by making user_id nullable temporarily during creation
-- We'll still enforce ownership through application logic

-- First, drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;

-- Recreate policies to support guest campaigns
-- Allow anyone to create campaigns (guest or authenticated)
CREATE POLICY "Anyone can create campaigns"
ON campaigns FOR INSERT
WITH CHECK (true);

-- Allow users to view their own campaigns OR campaigns with null user_id (guest campaigns)
CREATE POLICY "Users can view their own or guest campaigns"
ON campaigns FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own campaigns OR claim guest campaigns
CREATE POLICY "Users can update their own or claim guest campaigns"
ON campaigns FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete only their own campaigns
CREATE POLICY "Users can delete their own campaigns"
ON campaigns FOR DELETE
USING (auth.uid() = user_id);

-- Update email_sequences policies to handle guest campaigns
DROP POLICY IF EXISTS "Users can view emails from their campaigns" ON email_sequences;
DROP POLICY IF EXISTS "Users can create emails for their campaigns" ON email_sequences;
DROP POLICY IF EXISTS "Users can update emails from their campaigns" ON email_sequences;
DROP POLICY IF EXISTS "Users can delete emails from their campaigns" ON email_sequences;

-- Allow viewing email sequences for owned campaigns or guest campaigns
CREATE POLICY "Users can view emails from their or guest campaigns"
ON email_sequences FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = email_sequences.campaign_id 
    AND (campaigns.user_id = auth.uid() OR campaigns.user_id IS NULL)
  )
);

-- Allow creating email sequences for any campaign (needed for edge function)
CREATE POLICY "Anyone can create email sequences"
ON email_sequences FOR INSERT
WITH CHECK (true);

-- Allow updating email sequences for owned or guest campaigns
CREATE POLICY "Users can update emails from their or guest campaigns"
ON email_sequences FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = email_sequences.campaign_id 
    AND (campaigns.user_id = auth.uid() OR campaigns.user_id IS NULL)
  )
);

-- Allow deleting email sequences only from owned campaigns
CREATE POLICY "Users can delete emails from their campaigns"
ON email_sequences FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = email_sequences.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);