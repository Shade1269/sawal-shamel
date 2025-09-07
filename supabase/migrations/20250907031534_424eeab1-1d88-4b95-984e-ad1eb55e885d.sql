-- Create a table to store Zoho integration settings
CREATE TABLE public.zoho_integration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  access_token TEXT,
  organization_id TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zoho_integration ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Shop owners can manage zoho integration"
ON public.zoho_integration
FOR ALL
USING (shop_id IN (
  SELECT s.id
  FROM shops s
  JOIN profiles p ON p.id = s.owner_id
  WHERE p.auth_user_id = auth.uid()
));

-- Create table to map Zoho products to local products
CREATE TABLE public.zoho_product_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  zoho_item_id TEXT NOT NULL,
  local_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, zoho_item_id)
);

-- Enable RLS
ALTER TABLE public.zoho_product_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Shop owners can manage zoho product mapping"
ON public.zoho_product_mapping
FOR ALL
USING (shop_id IN (
  SELECT s.id
  FROM shops s
  JOIN profiles p ON p.id = s.owner_id
  WHERE p.auth_user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_zoho_integration_updated_at
BEFORE UPDATE ON public.zoho_integration
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();