-- Update the handle_new_user function to give new users a free trial with 20 credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Give new users a free trial with 20 credits
  INSERT INTO public.user_usage (user_id, plan, generations_limit, generations_used, subscription_status)
  VALUES (NEW.id, 'trial', 20, 0, 'trial')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;