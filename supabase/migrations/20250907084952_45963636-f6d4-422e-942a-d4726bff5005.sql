-- Add attributes_schema column to products table for storing variant attributes structure
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS attributes_schema JSONB DEFAULT '{}';

-- Add external_id column to products table for Zoho integration
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Add external_id column to product_variants table for Zoho item_id mapping
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Add option columns to product_variants for better variant structure
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS option1_name TEXT,
ADD COLUMN IF NOT EXISTS option1_value TEXT,
ADD COLUMN IF NOT EXISTS option2_name TEXT,
ADD COLUMN IF NOT EXISTS option2_value TEXT;

-- Add index on external_id for better performance
CREATE INDEX IF NOT EXISTS idx_products_external_id ON public.products(external_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_external_id ON public.product_variants(external_id);