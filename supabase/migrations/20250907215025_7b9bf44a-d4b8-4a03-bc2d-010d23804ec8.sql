-- Delete old Zoho products and their mappings that were created with the old logic
-- This removes products that don't follow the new model-based structure

-- Delete from zoho_product_mapping for products that will be removed
DELETE FROM zoho_product_mapping 
WHERE local_product_id IN (
  SELECT p.id 
  FROM products p 
  JOIN merchants m ON m.id = p.merchant_id 
  JOIN profiles pr ON pr.id = m.profile_id
  WHERE m.business_name = 'Zoho Import'
  AND p.external_id NOT LIKE 'model_%'
);

-- Delete product variants for old Zoho products
DELETE FROM product_variants 
WHERE product_id IN (
  SELECT p.id 
  FROM products p 
  JOIN merchants m ON m.id = p.merchant_id 
  JOIN profiles pr ON pr.id = m.profile_id
  WHERE m.business_name = 'Zoho Import'
  AND p.external_id NOT LIKE 'model_%'
);

-- Delete old Zoho products that don't follow the new external_id pattern
DELETE FROM products 
WHERE id IN (
  SELECT p.id 
  FROM products p 
  JOIN merchants m ON m.id = p.merchant_id 
  JOIN profiles pr ON pr.id = m.profile_id
  WHERE m.business_name = 'Zoho Import'
  AND p.external_id NOT LIKE 'model_%'
);