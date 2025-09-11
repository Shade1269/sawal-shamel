-- Add unique constraints for zoho tables to fix ON CONFLICT errors

-- For zoho_integration table - one integration per shop
ALTER TABLE zoho_integration 
ADD CONSTRAINT zoho_integration_shop_id_unique UNIQUE (shop_id);

-- For zoho_product_mapping table - unique mapping per zoho item and shop
ALTER TABLE zoho_product_mapping 
ADD CONSTRAINT zoho_product_mapping_unique UNIQUE (zoho_item_id, shop_id);

-- For zoho_sync_settings table - one setting per shop
ALTER TABLE zoho_sync_settings 
ADD CONSTRAINT zoho_sync_settings_shop_id_unique UNIQUE (shop_id);