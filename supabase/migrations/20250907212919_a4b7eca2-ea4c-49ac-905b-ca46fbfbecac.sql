-- Delete existing Zoho products and their variants and mappings to clean up
DELETE FROM product_variants 
WHERE product_id IN (
  SELECT p.id 
  FROM products p 
  WHERE p.external_id IS NOT NULL 
  AND p.external_id != ''
);

DELETE FROM product_library 
WHERE product_id IN (
  SELECT p.id 
  FROM products p 
  WHERE p.external_id IS NOT NULL 
  AND p.external_id != ''
);

DELETE FROM zoho_product_mapping;

DELETE FROM products 
WHERE external_id IS NOT NULL 
AND external_id != '';