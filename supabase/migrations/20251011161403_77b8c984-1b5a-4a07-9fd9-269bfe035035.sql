-- Add lemonsqueezy_customer_id to user_usage table if not exists
ALTER TABLE user_usage
ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_lemonsqueezy_customer_id 
ON user_usage(lemonsqueezy_customer_id);