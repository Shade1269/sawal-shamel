-- إضافة عمود customer_session_id إلى جدول ecommerce_orders
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS customer_session_id UUID REFERENCES customer_otp_sessions(id);

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_customer_session 
ON ecommerce_orders(customer_session_id);

-- إضافة عمود customer_session_id إلى جدول simple_orders أيضاً
ALTER TABLE simple_orders 
ADD COLUMN IF NOT EXISTS customer_session_id UUID REFERENCES customer_otp_sessions(id);

CREATE INDEX IF NOT EXISTS idx_simple_orders_customer_session 
ON simple_orders(customer_session_id);

-- تحديث RLS policy لجدول simple_orders لدعم الجلسات
DROP POLICY IF EXISTS "Public can view their orders" ON simple_orders;

CREATE POLICY "Customers can view their orders via session"
ON simple_orders FOR SELECT
USING (
  customer_session_id IN (
    SELECT id FROM customer_otp_sessions 
    WHERE verified = true 
    AND expires_at > now()
  )
  OR auth.uid() IS NOT NULL
);

-- تحديث RLS policy لجدول ecommerce_orders
DROP POLICY IF EXISTS "Users can view their orders" ON ecommerce_orders;

CREATE POLICY "Customers can view their orders via session"
ON ecommerce_orders FOR SELECT
USING (
  customer_session_id IN (
    SELECT id FROM customer_otp_sessions 
    WHERE verified = true 
    AND expires_at > now()
  )
  OR auth.uid() IS NOT NULL
);