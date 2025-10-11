-- Fix 1: Add missing INSERT policy for profiles table
-- This allows new users to create their profile during onboarding
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Fix 2: Add missing UPDATE policy for user_usage table
-- This allows the system to update usage tracking
CREATE POLICY "Users can update their own usage"
ON public.user_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Fix 3: Ensure increment_user_generations function has proper search_path
-- This prevents potential SQL injection issues
CREATE OR REPLACE FUNCTION public.increment_user_generations(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE user_usage
  SET generations_used = generations_used + 1
  WHERE user_usage.user_id = increment_user_generations.user_id;
END;
$function$;