-- مسح جميع بيانات Zoho الموجودة
DELETE FROM zoho_product_mapping;
DELETE FROM zoho_sync_settings;
DELETE FROM zoho_integration;

-- إعادة تعيين تسلسل IDs إذا لزم الأمر
-- هذا سينظف قاعدة البيانات تماماً من بيانات Zoho