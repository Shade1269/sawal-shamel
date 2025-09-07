-- Delete old products that were created before implementing the new model-based logic
-- These products have creation dates before the latest sync logic was implemented

-- First, get the products to be deleted (for logging)
-- Delete from zoho_product_mapping for products that will be removed
DELETE FROM zoho_product_mapping 
WHERE local_product_id IN (
  SELECT p.id 
  FROM products p 
  JOIN merchants m ON m.id = p.merchant_id 
  WHERE m.business_name = 'Zoho Import'
  AND p.created_at < '2025-09-07 22:00:00'::timestamp
);

-- Delete product variants for old products
DELETE FROM product_variants 
WHERE product_id IN (
  SELECT p.id 
  FROM products p 
  JOIN merchants m ON m.id = p.merchant_id 
  WHERE m.business_name = 'Zoho Import'
  AND p.created_at < '2025-09-07 22:00:00'::timestamp
);

-- Delete old products from before the background sync implementation
DELETE FROM products 
WHERE id IN (
  SELECT p.id 
  FROM products p 
  JOIN merchants m ON m.id = p.merchant_id 
  WHERE m.business_name = 'Zoho Import'
  AND p.created_at < '2025-09-07 22:00:00'::timestamp
);