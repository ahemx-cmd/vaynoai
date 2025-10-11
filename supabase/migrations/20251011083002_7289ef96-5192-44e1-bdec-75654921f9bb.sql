-- Create function to increment user generations
CREATE OR REPLACE FUNCTION increment_user_generations(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_usage
  SET generations_used = generations_used + 1
  WHERE user_usage.user_id = increment_user_generations.user_id;
END;
$$;