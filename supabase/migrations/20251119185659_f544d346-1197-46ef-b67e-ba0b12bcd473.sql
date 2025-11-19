-- Create function to safely add topup credits
CREATE OR REPLACE FUNCTION public.add_topup_credits(
  p_user_id uuid,
  p_credits integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_usage
  SET topup_credits = topup_credits + p_credits
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
END;
$$;

-- Update increment_user_generations to use topup credits first
CREATE OR REPLACE FUNCTION public.increment_user_generations(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  total_available integer;
BEGIN
  -- Fetch current user usage data
  SELECT * INTO user_record
  FROM user_usage
  WHERE user_usage.user_id = increment_user_generations.user_id;
  
  -- Check if credit period has expired and reset if needed
  IF user_record.current_period_end IS NOT NULL 
     AND user_record.current_period_end < NOW() 
     AND user_record.subscription_status IN ('active', 'trial')
     AND user_record.plan != 'free' THEN
    
    -- Reset credits and update period
    UPDATE user_usage
    SET 
      generations_used = 0,
      current_period_end = NOW() + INTERVAL '1 month'
    WHERE user_usage.user_id = increment_user_generations.user_id;
    
    -- Refresh user_record after reset
    SELECT * INTO user_record
    FROM user_usage
    WHERE user_usage.user_id = increment_user_generations.user_id;
    
    RAISE NOTICE 'Auto-reset credits for user % (plan: %)', user_id, user_record.plan;
  END IF;
  
  -- Calculate total available credits (subscription + topup)
  total_available := (user_record.generations_limit - user_record.generations_used) + user_record.topup_credits;
  
  -- Check if user has any credits available
  IF total_available <= 0 THEN
    RAISE EXCEPTION 'Insufficient credits. Please purchase more credits to continue.';
  END IF;
  
  -- Use topup credits first, then subscription credits
  IF user_record.topup_credits > 0 THEN
    -- Deduct from topup credits
    UPDATE user_usage
    SET topup_credits = topup_credits - 1
    WHERE user_usage.user_id = increment_user_generations.user_id;
    
    RAISE NOTICE 'Used topup credit for user %. Remaining topup: %', user_id, user_record.topup_credits - 1;
  ELSE
    -- Deduct from subscription credits
    UPDATE user_usage
    SET generations_used = generations_used + 1
    WHERE user_usage.user_id = increment_user_generations.user_id;
    
    RAISE NOTICE 'Used subscription credit for user %. Used: %/%', user_id, user_record.generations_used + 1, user_record.generations_limit;
  END IF;
END;
$$;