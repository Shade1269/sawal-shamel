#!/bin/bash

# Script لإضافة Zoho Secrets تلقائياً
# يمكنك تشغيله مباشرة بعد تثبيت Supabase CLI

echo "🚀 بدء إضافة Zoho Secrets..."
echo ""

# إضافة Secrets
echo "📝 إضافة ZOHO_CLIENT_ID..."
supabase secrets set ZOHO_CLIENT_ID="1000.ZDQAV4GXQHEIHOF7WSENI2ENLUC7AX"

echo "📝 إضافة ZOHO_CLIENT_SECRET..."
supabase secrets set ZOHO_CLIENT_SECRET="96093f652f6e2ecb218b307b07648d6ad39fc206b3"

echo "📝 إضافة ZOHO_ORGANIZATION_ID..."
supabase secrets set ZOHO_ORGANIZATION_ID="873923256"

echo ""
echo "✅ تم إضافة 3 من 4 Secrets!"
echo ""
echo "⚠️  متبقي: ZOHO_REFRESH_TOKEN"
echo "   سنحصل عليه في الخطوة التالية"
echo ""
echo "🔍 التحقق من Secrets المضافة:"
supabase secrets list

echo ""
echo "✅ انتهى! الآن ننتقل للخطوة التالية..."
