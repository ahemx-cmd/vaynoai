-- Create klaviyo_connections table for storing user API keys
CREATE TABLE public.klaviyo_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  api_key_encrypted text NOT NULL,
  is_connected boolean DEFAULT true,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.klaviyo_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only manage their own connection
CREATE POLICY "Users can view their own Klaviyo connection"
  ON public.klaviyo_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Klaviyo connection"
  ON public.klaviyo_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Klaviyo connection"
  ON public.klaviyo_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Klaviyo connection"
  ON public.klaviyo_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create klaviyo_exports table for tracking export history
CREATE TABLE public.klaviyo_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('draft', 'flow')),
  klaviyo_template_ids jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.klaviyo_exports ENABLE ROW LEVEL SECURITY;

-- RLS policies for exports
CREATE POLICY "Users can view their own exports"
  ON public.klaviyo_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports"
  ON public.klaviyo_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports"
  ON public.klaviyo_exports FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for klaviyo_connections
CREATE TRIGGER update_klaviyo_connections_updated_at
  BEFORE UPDATE ON public.klaviyo_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();