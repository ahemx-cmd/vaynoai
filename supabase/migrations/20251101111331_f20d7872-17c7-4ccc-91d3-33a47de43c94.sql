-- Allow null user_id for guest campaigns
ALTER TABLE campaigns 
ALTER COLUMN user_id DROP NOT NULL;