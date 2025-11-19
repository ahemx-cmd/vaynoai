-- Add topup_credits column to track one-time credit purchases
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS topup_credits integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_usage.topup_credits IS 'One-time purchased credits that do not expire or reset monthly';