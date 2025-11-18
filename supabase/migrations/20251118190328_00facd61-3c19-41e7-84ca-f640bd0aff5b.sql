-- Update increment_user_generations function to auto-reset expired credits
CREATE OR REPLACE FUNCTION public.increment_user_generations(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
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
    
    -- Log the reset
    RAISE NOTICE 'Auto-reset credits for user % (plan: %)', user_id, user_record.plan;
  END IF;
  
  -- Increment generations used
  UPDATE user_usage
  SET generations_used = generations_used + 1
  WHERE user_usage.user_id = increment_user_generations.user_id;
END;
$function$;